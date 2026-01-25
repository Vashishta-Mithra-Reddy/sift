"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { addQuestions, addSections } from "@sift/auth/actions/sifts";
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

const LEARNING_PATH_SYSTEM_PROMPT = `You are Sift AI, an expert teacher.
Your task is to create a comprehensive, structured learning path for a given topic or content.

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
5. Output ONLY the JSON array, no other text.
`;

export async function generateQuestionsAction(siftId: string, content: string, mode: 'questions' | 'learn' = 'questions') {
    const MAX_ATTEMPTS = 3;
    const systemPrompt = mode === 'learn' ? LEARNING_PATH_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const userPrompt = mode === 'learn' ? `Create a learning path for: ${content}` : `Here is the content to generate questions from:\n\n${content}`;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(`Generating ${mode} for Sift: ${siftId} (Attempt ${attempt}/${MAX_ATTEMPTS})`);
            
            const { text } = await generateText({
                model: google("gemini-3-flash-preview"),
                system: systemPrompt,
                prompt: userPrompt,
            });

            // 1. Locate JSON
            const jsonStartIndex = text.indexOf('[');
            const jsonEndIndex = text.lastIndexOf(']') + 1;

            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                 throw new Error("AI did not return a valid JSON array");
            }

            // 2. Parse JSON
            const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
            const parsedData = JSON.parse(jsonString);

            if (!Array.isArray(parsedData)) {
                throw new Error("AI response is not an array");
            }

            const headerStore = await headers();
            let questionsCount = 0;

            if (mode === 'learn') {
                // Handle Learning Path (Sections)
                const sections = parsedData;
                
                // Save sections first to get IDs
                const sectionsToSave = sections.map((s: any, index: number) => ({
                    title: s.title,
                    content: s.content,
                    order: index
                }));
                
                const savedSections = await addSections(siftId, sectionsToSave, headerStore);
                
                // Map saved sections to questions
                const questionsToSave: any[] = [];
                
                sections.forEach((s: any, index: number) => {
                    const savedSection = savedSections.find(sec => sec.order === index);
                    
                    if (savedSection && s.questions && Array.isArray(s.questions)) {
                        s.questions.forEach((q: any) => {
                            questionsToSave.push({
                                ...q,
                                sectionId: savedSection.id,
                                tags: [content] // Use topic/content as tag
                            });
                        });
                    }
                });

                if (questionsToSave.length > 0) {
                     await addQuestions(siftId, questionsToSave, headerStore);
                     questionsCount = questionsToSave.length;
                }
            } else {
                // Handle Standard Questions
                const questions = parsedData;

                // Strict validation: Ensure exactly 4 options per question
                const invalidQuestions = questions.filter((q: any) => !Array.isArray(q.options) || q.options.length !== 4);
                if (invalidQuestions.length > 0) {
                    throw new Error(`Found ${invalidQuestions.length} questions with incorrect number of options (must be strictly 4)`);
                }

                await addQuestions(siftId, questions, headerStore);
                questionsCount = questions.length;
            }
            
            // 4. Notify listeners & Success
            eventBus.emit(`sift-ready-${siftId}`, { count: questionsCount });

            console.log(`${mode === 'learn' ? 'Learning path' : 'Questions'} saved successfully.`);
            return { success: true, count: questionsCount };

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

    console.error(`All attempts failed to generate ${mode}.`);
    return { success: false, error: `Failed to generate ${mode} after multiple attempts` };
}