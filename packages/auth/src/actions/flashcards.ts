import { addFlashcards as dbAddFlashcards, getFlashcards as dbGetFlashcards } from "@sift/db/queries/flashcards";
import { getSift } from "@sift/db/queries/sifts";
import { auth } from "../index";

export async function addFlashcards(siftId: string, cards: { front: string; back: string }[], headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    // Check ownership of sift
    const sift = await getSift(siftId);
    if (!sift || sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    return await dbAddFlashcards(siftId, cards);
}

export async function getFlashcards(siftId: string, headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    const sift = await getSift(siftId);
    if (!sift) return [];

    if (!sift.isPublic) {
         if (!session?.user || session.user.id !== sift.userId) {
             throw new Error("Unauthorized");
         }
    }

    return await dbGetFlashcards(siftId);
}
