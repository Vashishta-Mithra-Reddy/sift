import { db } from "..";
import { learningPaths, learningPathSifts } from "../schema";
import { eq, desc, and, asc } from "drizzle-orm";

export async function createLearningPath(userId: string, goal: string) {
    const [path] = await db.insert(learningPaths).values({
        id: crypto.randomUUID(),
        userId: userId,
        title: goal, // Ideally generated, but start with goal
        goal: goal,
        summary: "",
    }).returning();
    return path;
}

export async function getLearningPaths(userId: string) {
    return await db.query.learningPaths.findMany({
        where: eq(learningPaths.userId, userId),
        orderBy: [desc(learningPaths.updatedAt)],
        with: {
            sifts: {
                with: {
                    sift: true
                },
                orderBy: (lps, { asc }) => [asc(lps.order)]
            }
        }
    });
}

export async function getLearningPath(id: string) {
    return await db.query.learningPaths.findFirst({
        where: eq(learningPaths.id, id),
        with: {
            sifts: {
                with: {
                    sift: {
                        with: {
                            source: true
                        }
                    }
                },
                orderBy: (lps, { asc }) => [asc(lps.order)]
            }
        }
    });
}

export async function addSiftToPath(pathId: string, siftId: string) {
    // Get current count to determine order
    const existing = await db.select().from(learningPathSifts).where(eq(learningPathSifts.pathId, pathId));
    const order = existing.length;

    await db.insert(learningPathSifts).values({
        id: crypto.randomUUID(),
        pathId,
        siftId,
        order
    });
}

export async function updatePathSummary(pathId: string, newSummary: string) {
    // Append new summary to existing
    const path = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.id, pathId)
    });

    if (!path) return;

    const updatedSummary = path.summary 
        ? `${path.summary}\n- ${newSummary}`
        : `- ${newSummary}`;

    await db.update(learningPaths)
        .set({ summary: updatedSummary })
        .where(eq(learningPaths.id, pathId));
}

export async function getLearningPathForSift(siftId: string) {
    const link = await db.query.learningPathSifts.findFirst({
        where: eq(learningPathSifts.siftId, siftId),
        with: {
            path: {
                with: {
                    sifts: {
                        orderBy: (lps, { asc }) => [asc(lps.order)]
                    }
                }
            }
        }
    });

    if (!link) return null;
    return link.path;
}
