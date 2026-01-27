import { google } from "@ai-sdk/google";
import { streamText} from 'ai';
import { SYSTEM_PROMPT, LEARNING_PATH_SYSTEM_PROMPT } from "@/lib/ai-prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, mode } = await req.json();

  if (mode === "plan") {
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: `You are an expert study planner. Create a SHORT, clean, simple study plan (max 3 sections) for the given topic. 
      Use Markdown formatting. 
      Focus ONLY on key concepts.
      The goal is to prepare the user for a detailed quiz.`,
      prompt: `Create a study outline for: ${prompt}`,
    });
    return result.toTextStreamResponse();
  } else if (mode === "learn") {
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: LEARNING_PATH_SYSTEM_PROMPT,
      prompt: `Create a learning path for: ${prompt}`,
    });
    return result.toTextStreamResponse();
  } else {
    // Mode is "questions" (direct or from plan)
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      prompt: `Generate questions based on this content:\n\n${prompt}`,
    });
    return result.toTextStreamResponse();
  }
}
