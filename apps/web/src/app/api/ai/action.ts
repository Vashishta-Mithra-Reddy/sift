"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { addQuestions } from "@sift/auth/actions/sifts";
import { headers } from "next/headers";

const SYSTEM_PROMPT = `You are Sift AI, an expert at creating active recall study materials.
Your task is to analyze the provided text and generate a set of high-quality Multiple Choice Questions (MCQ).

Output Format: JSON Array
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text (must match one of the options exactly)",
    "correctOption": "A", // The letter of the correct option (A, B, C, or D)
    "explanation": "Why this is the answer",
    "tags": ["tag1", "tag2"]
  }
]

Rules:
1. Focus on key concepts and facts.
2. Provide exactly 4 options for each question.
3. Ensure there is only one correct answer.
4. Keep explanations concise but helpful.
5. Output ONLY the JSON array, no other text.`;

export async function generateQuestionsAction(siftId: string, content: string) {
    try {
        console.log("Generating questions for Sift:", siftId);
        
        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            system: SYSTEM_PROMPT,
            prompt: `Here is the content to generate questions from:\n\n${content}`,
        });

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const questions = JSON.parse(cleanedText);

        if (!Array.isArray(questions)) {
            throw new Error("AI response is not an array");
        }

        console.log(`Generated ${questions.length} questions. Saving...`);
        
        // Save to DB
        await addQuestions(siftId, questions, await headers());
        
        console.log("Questions saved successfully.");
        return { success: true, count: questions.length };

    } catch (error) {
        console.error("Failed to generate questions:", error);
        return { success: false, error: "Failed to generate questions" };
    }
}
