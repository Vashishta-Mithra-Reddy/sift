import { 
    createSift as dbCreateSift, 
    addQuestionsToSift as dbAddQuestionsToSift, 
    addSectionsToSift as dbAddSectionsToSift,
    getSifts as dbGetSifts, 
    getSift as dbGetSift, 
    updateSift as dbUpdateSift,
    getPublicSifts as dbGetPublicSifts,
    getArchivedSifts as dbGetArchivedSifts,
    deleteSift as dbDeleteSift,
    createSiftSession as dbCreateSiftSession,
    updateSiftSession as dbUpdateSiftSession,
    addSessionAnswers as dbAddSessionAnswers,
    getSiftSessions as dbGetSiftSessions,
    getSiftSessionDetails as dbGetSiftSessionDetails,
    deleteSiftSession as dbDeleteSiftSession,
    type CreateSiftInput, 
    type CreateQuestionInput 
} from "@sift/db/queries/sifts";
import { auth } from "../index";
import type { SiftWithSource, SiftWithQuestions, NewSift } from "@sift/db/types";

export async function createSift(data: CreateSiftInput, headers: Headers): Promise<string> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await dbCreateSift(session.user.id, data);
}

export async function addQuestions(siftId: string, questions: CreateQuestionInput[], headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    // Check ownership of sift
    const sift = await dbGetSift(siftId);
    if (!sift || sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }
  
    return await dbAddQuestionsToSift(siftId, questions);
}

export async function addSections(siftId: string, sections: { title: string; content: string; order: number }[], headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    // Check ownership of sift
    const sift = await dbGetSift(siftId);
    if (!sift || sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }
  
    return await dbAddSectionsToSift(siftId, sections);
}

export async function getSifts(headers: Headers): Promise<SiftWithSource[]> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await dbGetSifts(session.user.id);
}

export async function getArchivedSifts(headers: Headers): Promise<SiftWithSource[]> {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    return await dbGetArchivedSifts(session.user.id);
}

export async function getSift(id: string, headers: Headers): Promise<SiftWithQuestions | undefined> {
  const session = await auth.api.getSession({
    headers,
  });

  // Allow public access, but we still need a session for some features maybe?
  // Actually, if it's public, maybe we don't need a session?
  // For now, let's assume user must be logged in to view even public sifts to play them (since sessions are tied to users)
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const sift = await dbGetSift(id);
  
  if (sift && sift.userId !== session.user.id && !sift.isPublic) {
    throw new Error("Unauthorized");
  }

  return sift;
}

export async function getPublicSifts(headers: Headers): Promise<SiftWithSource[]> {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    return await dbGetPublicSifts();
}

export async function deleteSift(id: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const sift = await dbGetSift(id);
    if (!sift) return;

    if (sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await dbDeleteSift(id);
}

export async function updateSift(id: string, data: Partial<NewSift>, headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    // Verify ownership
    const sift = await dbGetSift(id);
    if (!sift) return;
    
    if (sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }
  
    return await dbUpdateSift(id, data);
}

export async function updateSiftSummary(id: string, summary: string, headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    // Verify ownership
    const sift = await dbGetSift(id);
    if (!sift) return;
    
    if (sift.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }
  
    return await dbUpdateSift(id, { summary });
}

// Session Actions

export async function createSiftSession(siftId: string, headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error("Unauthorized");
    return await dbCreateSiftSession(session.user.id, siftId);
}

export async function updateSiftSession(id: string, data: { status?: "completed" | "abandoned"; score?: number; completedAt?: Date }, headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error("Unauthorized");
    await dbUpdateSiftSession(id, data);
}

export async function addSessionAnswers(sessionId: string, answers: { questionId: string; userAnswer: string; isCorrect: boolean }[], headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error("Unauthorized");
    await dbAddSessionAnswers(sessionId, answers);
}

export async function getSiftSessions(siftId: string, headers: Headers) {
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    return await dbGetSiftSessions(session.user.id, siftId);
}

export async function getSiftSessionDetails(sessionId: string, headers: Headers) {
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const siftSession = await dbGetSiftSessionDetails(sessionId);
    if (!siftSession) return null;

    if (siftSession.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    return siftSession;
}

export async function deleteSiftSession(sessionId: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await dbDeleteSiftSession(sessionId, session.user.id);
}
