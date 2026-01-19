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

    // 1. Aggregate updates by topic to avoid "ON CONFLICT" duplicate key errors within the same batch.
    // We calculate the average mastery level for duplicate topics in this batch.
    const aggregated = updates.reduce((acc, { topic, level }) => {
        if (!acc.has(topic)) {
            acc.set(topic, { total: 0, count: 0 });
        }
        const entry = acc.get(topic)!;
        entry.total += level;
        entry.count += 1;
        return acc;
    }, new Map<string, { total: number; count: number }>());

    const uniqueUpdates = Array.from(aggregated.entries()).map(([topic, { total, count }]) => ({
        topic,
        level: Math.round(total / count)
    }));

    // 2. Use bulk upsert with ON CONFLICT DO UPDATE
    const values: NewEcho[] = uniqueUpdates.map(update => ({
        id: crypto.randomUUID(),
        userId,
        sourceId,
        topic: update.topic,
        masteryLevel: update.level,
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    await db.insert(echoes).values(values).onConflictDoUpdate({
        target: [echoes.userId, echoes.sourceId, echoes.topic],
        set: {
            // Update with the new calculated average for this batch
            // In the future, we might want to average with the EXISTING db value too:
            // masteryLevel: sql`(${echoes.masteryLevel} + excluded.mastery_level) / 2`
            // For now, "latest batch wins" is the logic.
            masteryLevel: sql`excluded.mastery_level`,
            lastReviewedAt: sql`excluded.last_reviewed_at`,
            updatedAt: new Date(),
        }
    });
}
