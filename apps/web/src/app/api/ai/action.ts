"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { addQuestions } from "@sift/auth/actions/sifts";
import { headers } from "next/headers";
import { eventBus } from "@/lib/events";

// Helper function to pause execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_PROMPT = `You are Sift AI, an expert at creating active recall study materials.
Your task is to analyze the provided text and generate a set of high-quality Multiple Choice Questions (MCQ).

Output Format: JSON Array
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text (must match one of the options exactly)",
    "correctOption": "A",
    "explanation": "Why this is the answer",
    "tags": ["tag1", "tag2"]
  }
]

Rules:
1. Focus on key concepts and facts.
2. Strictly Provide exactly 4 options for each question.
3. Ensure there is only one correct answer.
4. Keep explanations concise but helpful.
5. Output ONLY the JSON array, no other text.`;

export async function generateQuestionsAction(siftId: string, content: string) {
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(`Generating questions for Sift: ${siftId} (Attempt ${attempt}/${MAX_ATTEMPTS})`);
            
            const { text } = await generateText({
                model: google("gemini-3-flash-preview"),
                system: SYSTEM_PROMPT,
                prompt: `Here is the content to generate questions from:\n\n${content}`,
            });

            // 1. Locate JSON
            const jsonStartIndex = text.indexOf('[');
            const jsonEndIndex = text.lastIndexOf(']') + 1;

            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                 throw new Error("AI did not return a valid JSON array");
            }

            // 2. Parse JSON
            const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
            const questions = JSON.parse(jsonString);

            if (!Array.isArray(questions)) {
                throw new Error("AI response is not an array");
            }

            // Strict validation: Ensure exactly 4 options per question
            const invalidQuestions = questions.filter((q: any) => !Array.isArray(q.options) || q.options.length !== 4);
            if (invalidQuestions.length > 0) {
                throw new Error(`Found ${invalidQuestions.length} questions with incorrect number of options (must be strictly 4)`);
            }

            console.log(`Generated ${questions.length} questions. Saving...`);
            
            // 3. Save to DB
            // Optimization: Get headers once
            const headerStore = await headers();
            await addQuestions(siftId, questions, headerStore);
            
            // 4. Notify listeners & Success
            eventBus.emit(`sift-ready-${siftId}`, { count: questions.length });

            console.log("Questions saved successfully.");
            return { success: true, count: questions.length };

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            // If we have attempts left, wait before retrying (Exponential Backoff)
            if (attempt < MAX_ATTEMPTS) {
                const waitTime = 1000 * attempt; // Wait 1s, then 2s
                console.log(`Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            }
        }
    }

    console.error("All attempts failed to generate questions.");
    return { success: false, error: "Failed to generate questions after multiple attempts" };
}