"use server";

import { addSiftToPath, getLearningPaths, getLearningPath, getLearningPathForSift } from "@sift/auth/actions/learning-paths";
import { createSift } from "@sift/auth/actions/sifts";
import { createSource } from "@sift/auth/actions/sources";
import { unstable_cache, revalidateTag } from "next/cache";
import { generateQuestionsAction } from "../api/ai/action";
import { getRequestContext } from "@/lib/cache";

export async function getLearningPathsAction() {
  const { headerStore, userId } = await getRequestContext();
  if (!userId || userId === "anonymous") {
    throw new Error("Unauthorized");
  }
  const cached = unstable_cache(
    () => getLearningPaths(headerStore),
    ["learning-paths-all", userId],
    { tags: [`learning-paths-all:${userId}`] }
  );
  return cached();
}

export async function getLearningPathAction(id: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    const cached = unstable_cache(
        () => getLearningPath(id, headerStore),
        ["learning-path-detail", userId, id],
        { tags: [`learning-path-detail:${userId}:${id}`] }
    );
    return cached();
}

export async function getLearningPathForSiftAction(siftId: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    const cached = unstable_cache(
        () => getLearningPathForSift(siftId, headerStore),
        ["learning-path-by-sift", userId, siftId],
        { tags: [`learning-path-by-sift:${userId}:${siftId}`] }
    );
    return cached();
}

export async function generateNextModuleAction(pathId: string, topic: string, currentSiftId?: string | null) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }

    const existingPath = await getLearningPath(pathId, headerStore);
    if (!existingPath) {
        throw new Error("Learning path not found");
    }

    if (!currentSiftId) {
        const lastSift = existingPath.sifts?.[existingPath.sifts.length - 1];
        if (lastSift?.siftId) {
            return { siftId: lastSift.siftId };
        }
    } else {
        const currentIndex = existingPath.sifts?.findIndex((s: any) => s.siftId === currentSiftId) ?? -1;
        const nextSift = currentIndex >= 0 ? existingPath.sifts?.[currentIndex + 1] : undefined;
        if (nextSift?.siftId) {
            return { siftId: nextSift.siftId };
        }
    }

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
    
    revalidateTag(`learning-paths-all:${userId}`, "default");
    revalidateTag(`learning-path-detail:${userId}:${pathId}`, "default");
    revalidateTag(`learning-path-by-sift:${userId}:${siftId}`, "default");
    revalidateTag(`sifts-active:${userId}`, "default");
    revalidateTag(`sift-detail:${siftId}`, "default");
    return { success: true, siftId };
}
