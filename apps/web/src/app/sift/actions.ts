"use server";

import { createSiftSession, updateSiftSession, addSessionAnswers, getSiftSessions, getSiftSessionDetails, deleteSiftSession, updateSift, deleteSift, getSift } from "@sift/auth/actions/sifts";
import { updateEchoMastery, batchUpdateEchoesAction as batchUpdateEchoes } from "@sift/auth/actions/echoes";
import { addFlashcards, getFlashcards } from "@sift/auth/actions/flashcards";
import { getLearningPathForSift, setLearningPathVisibility } from "@sift/auth/actions/learning-paths";
import { revalidateTag, unstable_cache } from "next/cache";
import type { NewSift } from "@sift/auth/types";
import { getRequestContext } from "@/lib/cache";

export async function getSiftAction(id: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    const cached = unstable_cache(
        () => getSift(id, headerStore),
        ["sift-detail", id, userId],
        { tags: [`sift-detail:${id}`] }
    );
    const sift = await cached();
    if (!sift) return null;
    return {
        ...sift,
        isOwner: sift.userId === userId
    };
}

export async function updateSiftAction(id: string, data: Partial<NewSift>) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }

    if (typeof data.isPublic !== 'undefined') {
        const path = await getLearningPathForSift(id, headerStore);
        if (path) {
            await setLearningPathVisibility(path.id, data.isPublic, headerStore);
            revalidateTag(`sift-detail:${id}`, "default");
            revalidateTag(`sifts-active:${userId}`, "default");
            revalidateTag(`sifts-archived:${userId}`, "default");
            revalidateTag(`sifts-public:global`, "default");
            revalidateTag(`learning-path-detail:${userId}:${path.id}`, "default");
            revalidateTag(`learning-paths-all:${userId}`, "default");
            
            // If we are only updating isPublic, we don't need to call updateSift because setLearningPathVisibility
            // already updated all sifts in the path (including this one).
            if (Object.keys(data).length === 1) return;
        }
    }

    await updateSift(id, data, headerStore);
    revalidateTag(`sift-detail:${id}`, "default");
    revalidateTag(`sifts-active:${userId}`, "default");
    revalidateTag(`sifts-archived:${userId}`, "default");
    revalidateTag(`sifts-public:global`, "default");
}

export async function deleteSiftAction(id: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await deleteSift(id, headerStore);
    revalidateTag(`sift-detail:${id}`, "default");
    revalidateTag(`sifts-active:${userId}`, "default");
    revalidateTag(`sifts-archived:${userId}`, "default");
    revalidateTag(`sifts-public:global`, "default");
}

export async function getSiftSessionsAction(siftId: string) {
    const { headerStore } = await getRequestContext();
    return getSiftSessions(siftId, headerStore);
}

export async function getSiftSessionDetailsAction(sessionId: string) {
    const { headerStore } = await getRequestContext();
    return getSiftSessionDetails(sessionId, headerStore);
}

export async function createSessionAction(siftId: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    const sessionId = await createSiftSession(siftId, headerStore);
    return sessionId;
}

export async function saveSessionAnswersAction(sessionId: string, answers: { questionId: string; userAnswer: string; isCorrect: boolean }[]) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await addSessionAnswers(sessionId, answers, headerStore);
}

export async function updateEchoMasteryAction(sourceId: string, topic: string, level: number) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await updateEchoMastery(sourceId, topic, level, headerStore);
    revalidateTag(`echoes-progress:${userId}`, "default");
}

export async function batchUpdateEchoesAction(sourceId: string, updates: { topic: string; level: number }[]) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await batchUpdateEchoes(sourceId, updates, headerStore);
    revalidateTag(`echoes-progress:${userId}`, "default");
}

export async function completeSessionAction(id: string, score: number) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await updateSiftSession(id, { status: "completed", score, completedAt: new Date() }, headerStore);
}

export async function deleteSessionAction(sessionId: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await deleteSiftSession(sessionId, headerStore);
}

export async function addFlashcardsAction(siftId: string, cards: { front: string; back: string }[]) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    await addFlashcards(siftId, cards, headerStore);
    revalidateTag(`flashcards-detail:${siftId}`, "default");
    revalidateTag(`sift-detail:${siftId}`, "default");
}

export async function getFlashcardsAction(siftId: string) {
    const { headerStore, userId } = await getRequestContext();
    if (!userId || userId === "anonymous") {
        throw new Error("Unauthorized");
    }
    const cached = unstable_cache(
        () => getFlashcards(siftId, headerStore),
        ["flashcards-detail", siftId, userId],
        { tags: [`flashcards-detail:${siftId}`] }
    );
    return cached();
}
