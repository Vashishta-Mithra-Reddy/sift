import { db } from "..";
import { flashcards } from "../schema/flashcards";
import { eq, asc } from "drizzle-orm";

export async function addFlashcards(siftId: string, cards: { front: string; back: string }[]) {
  const values = cards.map((card, index) => ({
    id: crypto.randomUUID(),
    siftId,
    front: card.front,
    back: card.back,
    order: index,
  }));

  if (values.length === 0) return [];

  return await db.insert(flashcards).values(values).returning();
}

export async function getFlashcards(siftId: string) {
  return await db.query.flashcards.findMany({
    where: eq(flashcards.siftId, siftId),
    orderBy: [asc(flashcards.order)],
  });
}
