import { db } from "..";
import { echoes } from "../schema/echoes";
import { eq, and, sql } from "drizzle-orm";
import type { Echo, NewEcho } from "../types";

export async function getEchoes(userId: string, sourceId?: string): Promise<Echo[]> {
    if (sourceId) {
        return await db.query.echoes.findMany({
            where: and(eq(echoes.userId, userId), eq(echoes.sourceId, sourceId)),
        });
    }
    return await db.query.echoes.findMany({
        where: eq(echoes.userId, userId),
    });
}

export async function updateEchoMastery(userId: string, sourceId: string, topic: string, level: number) {
    // Upsert: Insert or Update if exists
    const id = crypto.randomUUID();
    
    // Simple logic: Average the new level with the existing one (weighted towards new)
    // Or just overwrite. For now, we overwrite but update lastReviewedAt.
    
    // We want to update only if exists, or insert.
    // However, if it exists, we might want to do some math.
    // But ON CONFLICT SET only allows simple expressions or values.
    // Let's stick to simple overwrite for now, logic will be improved in the action layer.
    
    const newEcho: NewEcho = {
        id,
        userId,
        sourceId,
        topic,
        masteryLevel: level,
        lastReviewedAt: new Date(),
    };

    await db.insert(echoes).values(newEcho).onConflictDoUpdate({
        target: [echoes.userId, echoes.sourceId, echoes.topic],
        set: {
            masteryLevel: level, // In future: sql`(${echoes.masteryLevel} + ${level}) / 2`
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
        }
    });
}

export async function batchUpdateEchoMastery(
    userId: string, 
    sourceId: string, 
    updates: { topic: string; level: number }[]
) {
    if (updates.length === 0) return;

    // Since Drizzle doesn't support bulk upsert easily with different values for each row in a single query
    // (unless using unnest/json_table which is complex), we'll use a transaction of single upserts.
    // It's still better than independent network calls.
    
    await db.transaction(async (tx) => {
        for (const update of updates) {
            const id = crypto.randomUUID();
            const newEcho: NewEcho = {
                id,
                userId,
                sourceId,
                topic: update.topic,
                masteryLevel: update.level,
                lastReviewedAt: new Date(),
            };

            await tx.insert(echoes).values(newEcho).onConflictDoUpdate({
                target: [echoes.userId, echoes.sourceId, echoes.topic],
                set: {
                    masteryLevel: update.level,
                    lastReviewedAt: new Date(),
                    updatedAt: new Date(),
                }
            });
        }
    });
}
