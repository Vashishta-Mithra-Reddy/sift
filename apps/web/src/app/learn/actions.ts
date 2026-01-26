"use server";

import { getLearningPaths, getLearningPath, getLearningPathForSift, addSiftToPath } from "@sift/auth/actions/learning-paths";
import { createSift } from "@sift/auth/actions/sifts";
import { createSource } from "@sift/auth/actions/sources";
import { headers } from "next/headers";
import { after } from "next/server";
import { generateQuestionsAction } from "../api/ai/action";

export async function getLearningPathsAction() {
  const headerStore = await headers();
  return await getLearningPaths(headerStore);
}

export async function getLearningPathAction(id: string) {
    const headerStore = await headers();
    return await getLearningPath(id, headerStore);
}

export async function getLearningPathForSiftAction(siftId: string) {
    const headerStore = await headers();
    return await getLearningPathForSift(siftId, headerStore);
}

export async function generateNextModuleAction(pathId: string, topic: string) {
    const headerStore = await headers();

    // 1. Create Source
    const sourceId = await createSource({
        title: topic,
        fileName: "learning-path-module.txt",
        type: "text",
        content: `Learning Path Module for: ${topic}`,
        isPasted: true,
        metadata: {
            source: "learning-path",
            pathId: pathId
        }
    }, headerStore);

    // 2. Create Sift
    const siftId = await createSift({
        sourceId,
        config: {
            method: "learning-path",
            pathId: pathId
        }
    }, headerStore);

    // 3. Add to Path
    await addSiftToPath(pathId, siftId, headerStore);

    // 4. Trigger AI Generation
    // after(async () => {
    //     try {
    //         await generateQuestionsAction(siftId, topic, 'learn', pathId);
    //     } catch (e) {
    //         console.error("Background processing failed", e);
    //     }
    // });

    // 4. Trigger AI Generation (BLOCKING)
    // We remove 'after' and use 'await' so the function doesn't return 
    // until this completes.
    try {
        await generateQuestionsAction(siftId, topic, 'learn', pathId);
    } catch (e) {
        console.error("Processing failed", e);
        throw new Error("Failed to generate questions"); 
    }
    
    return { success: true, siftId };
}
