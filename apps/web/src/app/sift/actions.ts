"use server";

import { getSift, createSiftSession, updateSiftSession, addSessionAnswers, getSiftSessions, getSiftSessionDetails, deleteSiftSession, updateSift, deleteSift } from "@sift/auth/actions/sifts";
import { updateEchoMastery, batchUpdateEchoesAction as batchUpdateEchoes } from "@sift/auth/actions/echoes";
import { headers } from "next/headers";
import type { NewSift } from "@sift/auth/types";
import { auth } from "@sift/auth";

export async function getSiftAction(id: string) {
    const headerStore = await headers();
    const sift = await getSift(id, headerStore);
    if (!sift) return null;

    const session = await auth.api.getSession({
        headers: headerStore
    });
    
    return {
        ...sift,
        isOwner: session?.user?.id === sift.userId
    };
}

export async function updateSiftAction(id: string, data: Partial<NewSift>) {
    const headerStore = await headers();
    await updateSift(id, data, headerStore);
}

export async function deleteSiftAction(id: string) {
    const headerStore = await headers();
    await deleteSift(id, headerStore);
}

export async function getSiftSessionsAction(siftId: string) {
    const headerStore = await headers();
    return await getSiftSessions(siftId, headerStore);
}

export async function getSiftSessionDetailsAction(sessionId: string) {
    const headerStore = await headers();
    return await getSiftSessionDetails(sessionId, headerStore);
}

export async function createSessionAction(siftId: string) {
    const headerStore = await headers();
    return await createSiftSession(siftId, headerStore);
}

export async function saveSessionAnswersAction(sessionId: string, answers: { questionId: string; userAnswer: string; isCorrect: boolean }[]) {
    const headerStore = await headers();
    await addSessionAnswers(sessionId, answers, headerStore);
}

export async function updateEchoMasteryAction(sourceId: string, topic: string, level: number) {
    const headerStore = await headers();
    await updateEchoMastery(sourceId, topic, level, headerStore);
}

export async function batchUpdateEchoesAction(sourceId: string, updates: { topic: string; level: number }[]) {
    const headerStore = await headers();
    await batchUpdateEchoes(sourceId, updates, headerStore);
}

export async function completeSessionAction(id: string, score: number) {
    const headerStore = await headers();
    await updateSiftSession(id, { status: "completed", score, completedAt: new Date() }, headerStore);
}

export async function deleteSessionAction(sessionId: string) {
    const headerStore = await headers();
    await deleteSiftSession(sessionId, headerStore);
}
