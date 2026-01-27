"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { addQuestions, addSections, updateSiftSummary } from "@sift/auth/actions/sifts";
import { getLearningPath, updatePathSummary } from "@sift/auth/actions/learning-paths";
import { headers } from "next/headers";
import { eventBus } from "@/lib/events";
import { SYSTEM_PROMPT, LEARNING_PATH_SYSTEM_PROMPT } from "@/lib/ai-prompts";

// Helper function to pause execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateQuestionsAction(siftId: string, content: string, mode: 'questions' | 'learn' = 'questions', pathId?: string) {
    const MAX_ATTEMPTS = 3;
    const headerStore = await headers();
    const systemPrompt = mode === 'learn' ? LEARNING_PATH_SYSTEM_PROMPT : SYSTEM_PROMPT;
    
    
    let userPrompt = mode === 'learn' ? `Create a learning path for: ${content}` : `Here is the content to generate questions from:\n\n${content}`;

    // Inject Context for Learning Paths
    if (mode === 'learn' && pathId) {
        const path = await getLearningPath(pathId, headerStore);
        if (path && path.summary) {
            userPrompt = `CONTEXT: The user has already learned the following concepts:\n${path.summary}\n\nGOAL: ${content}\n\nINSTRUCTION: Create the NEXT logical module in this curriculum. Do not repeat the concepts already learned unless for brief review. Introduce new concepts that build upon the previous ones.\n\n${userPrompt}`;
        }
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(`Generating ${mode} for Sift: ${siftId} (Attempt ${attempt}/${MAX_ATTEMPTS})`);
            
            const { text } = await generateText({
                model: google("gemini-3-flash-preview"),
                system: systemPrompt,
                prompt: userPrompt,
            });

            // 1. Locate JSON
            const jsonStartIndex = text.indexOf(mode === 'learn' ? '{' : '[');
            const jsonEndIndex = text.lastIndexOf(mode === 'learn' ? '}' : ']') + 1;

            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                 throw new Error("AI did not return a valid JSON");
            }

            // 2. Parse JSON
            const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
            let parsedData: any = JSON.parse(jsonString);

            let questionsCount = 0;

            if (mode === 'learn') {
                // Handle Learning Path (Object with sections and summary)
                if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
                     // Fallback for array output if AI ignores object instruction (backwards compatibility)
                     if (Array.isArray(parsedData)) {
                         parsedData = { sections: parsedData };
                     } else {
                         throw new Error("AI response is not in the expected format");
                     }
                }

                // Fallback: Generate summary if missing (critical for context continuity)
                // if (!parsedData.summary && parsedData.sections && parsedData.sections.length > 0) {
                //      const titles = parsedData.sections.map((s: any) => s.title).join(', ');
                //      parsedData.summary = `Covered concepts: ${titles}`;
                // }

                const sections = parsedData.sections;
                
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

                // Update Path Summary
                if (pathId && parsedData.summary) {
                    await updatePathSummary(pathId, parsedData.summary, headerStore);
                }

                // Save summary to sift
                if (parsedData.summary) {
                    await updateSiftSummary(siftId, parsedData.summary, headerStore);
                }

            } else {
                // Handle Standard Questions
                if (!Array.isArray(parsedData)) {
                    throw new Error("AI response is not an array");
                }
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
