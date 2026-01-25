import { google } from "@ai-sdk/google";
import { streamText} from 'ai';

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
      system: `You are Sift AI, an expert teacher.
      Your task is to create a comprehensive, structured learning path for a given topic.
      
      Output Format: JSON Array of Sections
      [
        {
          "title": "Section Title",
          "content": "Digestible explanation of the concept in Markdown. Keep it engaging and clear.",
          "questions": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Correct option text",
              "correctOption": "A",
              "explanation": "Why this is correct",
              "tags": ["tag1"]
            }
          ]
        }
      ]
      
      Rules:
      1. Break the topic into logical steps/sections (Introduction, Key Concept 1, Key Concept 2, Advanced, etc.).
      2. Each section must have "content" (Markdown) and 1-3 "questions".
      3. Questions must strictly have 4 options.
      4. Content should be concise but sufficient to answer the questions.
      5. Output ONLY the JSON array, no other text.`,
      prompt: `Create a learning path for: ${prompt}`,
    });
    return result.toTextStreamResponse();
  } else {
    // Mode is "questions" (direct or from plan)
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: `You are Sift AI, an expert at creating active recall study materials.
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
      5. Output ONLY the JSON array, no other text. Do not use Markdown code blocks.`,
      prompt: `Generate questions based on this content:\n\n${prompt}`,
    });
    return result.toTextStreamResponse();
  }
}
