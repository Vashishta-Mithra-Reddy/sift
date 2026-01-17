"use server";

import { getSift, createSiftSession, updateSiftSession, addSessionAnswers, getSiftSessions, getSiftSessionDetails } from "@sift/auth/actions/sifts";
import { updateEchoMastery, batchUpdateEchoesAction as batchUpdateEchoes } from "@sift/auth/actions/echoes";
import { headers } from "next/headers";

export async function getSiftAction(id: string) {
    const headerStore = await headers();
    return await getSift(id, headerStore);
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
