import { addQuestions } from "@sift/auth/actions/sifts";
import { generateQuestionsAction } from "@/app/api/ai/action";
import { headers } from "next/headers";

type RawQuestion = {
  question: string;
  options?: string[];
  answer?: string;
  correctOption?: string; // "A" | "B" | "C" | "D"
  explanation?: string;
  tags?: string[];
};

type NormalizedQuestion = {
  question: string;
  options: string[];
  answer: string;
  correctOption?: string;
  explanation: string;
  tags: string[];
};

function stripMarkdownCodeBlocks(input: string) {
  return input.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function normalizeQuestions(raw: RawQuestion[]): NormalizedQuestion[] {
  return raw
    .filter((q) => q && q.question)
    .map((q) => {
      const options = (q.options ?? []).map((o) => String(o));
      let answer = q.answer ?? "";
      let correctOption = q.correctOption;

      if (!answer && correctOption && options.length) {
        const idx = correctOption.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < options.length) {
          answer = options[idx];
        }
      }

      if (!correctOption && answer && options.length) {
        const idx = options.indexOf(answer);
        if (idx >= 0) {
          correctOption = String.fromCharCode(65 + idx);
        }
      }

      return {
        question: String(q.question),
        options,
        answer,
        correctOption,
        explanation: q.explanation ?? "",
        tags: q.tags ?? [],
      } as NormalizedQuestion;
    })
    .filter((q): q is NormalizedQuestion => q.options.length >= 2 && !!q.answer);
}

export async function processSiftContent(siftId: string, content: string) {
    // 1. Try to parse as JSON questions first
    try {
      const cleaned = stripMarkdownCodeBlocks(content);
      // Only try parsing if it looks like JSON/Array
      if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
          const parsed = JSON.parse(cleaned) as unknown;
          if (Array.isArray(parsed)) {
            const normalized = normalizeQuestions(parsed as RawQuestion[]);
            if (normalized.length > 0) {
              await addQuestions(
                siftId,
                normalized.map((q) => ({
                  question: q.question,
                  answer: q.answer!,
                  correctOption: q.correctOption,
                  options: q.options,
                  explanation: q.explanation,
                  tags: q.tags, // Pass tags
                })),
                await headers()
              );
              return { success: true, mode: "json", count: normalized.length };
            }
          }
      }
    } catch {
      // Ignore JSON errors and fall through to AI
    }

    // 2. If not valid JSON questions, generate via AI
    return await generateQuestionsAction(siftId, content);
}
