import { db } from "..";
import { sifts, questions, siftSessions, sessionAnswers, siftSections } from "../schema/sifts";
import { eq, desc, and, asc } from "drizzle-orm";
import type { NewSift, SiftWithSource, SiftWithQuestions } from "../types";

export type CreateSiftInput = {
  sourceId: string;
  config?: Record<string, any>;
  isPublic?: boolean;
};

export type CreateQuestionInput = {
    question: string;
    answer: string;
    correctOption?: string;
    options?: string[]; // jsonb
    explanation?: string;
};

export async function createSift(userId: string, data: CreateSiftInput) {
  const id = crypto.randomUUID();
  const newSift: NewSift = {
    id,
    userId,
    sourceId: data.sourceId,
    config: data.config,
    status: "in_progress",
  };
  await db.insert(sifts).values(newSift);
  return id;
}

export async function addQuestionsToSift(siftId: string, questionsData: any[]) {
    const newQuestions = questionsData.map(q => ({
        id: crypto.randomUUID(),
        siftId,
        sectionId: q.sectionId, // Optional
        question: q.question,
        options: q.options, // jsonb
        answer: q.answer,
        correctOption: q.correctOption,
        explanation: q.explanation,
        tags: q.tags || [], // Ensure tags are saved
        createdAt: new Date(),
    }));

    if (newQuestions.length > 0) {
        await db.insert(questions).values(newQuestions);
    }
}

export async function addSectionsToSift(siftId: string, sectionsData: { title: string; content: string; order: number }[]) {
    const newSections = sectionsData.map(s => ({
        id: crypto.randomUUID(),
        siftId,
        title: s.title,
        content: s.content,
        order: s.order,
        createdAt: new Date(),
    }));

    if (newSections.length > 0) {
        return await db.insert(siftSections).values(newSections).returning();
    }
    return [];
}

export async function getSifts(userId: string): Promise<SiftWithSource[]> {
  const result = await db.query.sifts.findMany({
    where: and(eq(sifts.userId, userId), eq(sifts.isArchived, false)),
    orderBy: desc(sifts.createdAt),
    with: {
        source: true
    }
  });
  return result as SiftWithSource[];
}

export async function getArchivedSifts(userId: string): Promise<SiftWithSource[]> {
    const result = await db.query.sifts.findMany({
      where: and(eq(sifts.userId, userId), eq(sifts.isArchived, true)),
      orderBy: desc(sifts.createdAt),
      with: {
          source: true
      }
    });
    return result as SiftWithSource[];
}

export async function getSift(id: string): Promise<SiftWithQuestions | undefined> {
  const result = await db.query.sifts.findFirst({
    where: eq(sifts.id, id),
    with: {
        questions: true,
        sections: {
            orderBy: asc(siftSections.order),
            with: {
                questions: true
            }
        },
        source: true
    }
  });
  return result as SiftWithQuestions | undefined;
}

export async function getPublicSifts(): Promise<SiftWithSource[]> {
    const result = await db.query.sifts.findMany({
      where: and(eq(sifts.isPublic, true), eq(sifts.isArchived, false)),
      orderBy: desc(sifts.createdAt),
      with: {
          source: true
      }
    });
    return result as SiftWithSource[];
}

export async function updateSift(id: string, data: Partial<NewSift>) {
  await db.update(sifts).set(data).where(eq(sifts.id, id));
}

export async function deleteSift(id: string) {
    await db.delete(sifts).where(eq(sifts.id, id));
}

// --- Session Queries ---

export async function createSiftSession(userId: string, siftId: string) {
    const id = crypto.randomUUID();
    await db.insert(siftSessions).values({
        id,
        siftId,
        userId,
        status: "in_progress",
        startedAt: new Date(),
    });
    return id;
}

export async function updateSiftSession(id: string, data: { status?: "completed" | "abandoned"; score?: number; completedAt?: Date }) {
    await db.update(siftSessions).set(data).where(eq(siftSessions.id, id));
}

export async function addSessionAnswers(sessionId: string, answers: { questionId: string; userAnswer: string; isCorrect: boolean }[]) {
    if (answers.length === 0) return;
    
    await db.insert(sessionAnswers).values(answers.map(a => ({
        id: crypto.randomUUID(),
        sessionId,
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect,
        createdAt: new Date(),
    })));
}

export async function getSiftSessions(userId: string, siftId: string) {
    return await db.query.siftSessions.findMany({
        where: and(eq(siftSessions.userId, userId), eq(siftSessions.siftId, siftId)),
        orderBy: desc(siftSessions.startedAt),
    });
}

export async function getSiftSessionDetails(sessionId: string) {
    return await db.query.siftSessions.findFirst({
        where: eq(siftSessions.id, sessionId),
        with: {
            answers: {
                with: {
                    question: true
                }
            }
        }
    });
}

export async function deleteSiftSession(sessionId: string, userId: string) {
    // Ensure the session belongs to the user
    const session = await db.query.siftSessions.findFirst({
        where: and(eq(siftSessions.id, sessionId), eq(siftSessions.userId, userId))
    });

    if (!session) {
        throw new Error("Session not found or unauthorized");
    }

    await db.delete(siftSessions).where(eq(siftSessions.id, sessionId));
}
