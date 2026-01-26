import { 
    createLearningPath as dbCreateLearningPath, 
    getLearningPaths as dbGetLearningPaths, 
    getLearningPath as dbGetLearningPath, 
    addSiftToPath as dbAddSiftToPath, 
    updatePathSummary as dbUpdatePathSummary,
    getLearningPathForSift as dbGetLearningPathForSift
} from "@sift/db/queries/learning-paths";
import { auth } from "../index";

// --- Create ---

export async function createLearningPath(goal: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    return await dbCreateLearningPath(session.user.id, goal);
}

// --- Read ---

export async function getLearningPaths(headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        return [];
    }

    return await dbGetLearningPaths(session.user.id);
}

export async function getLearningPath(id: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        return null;
    }

    const path = await dbGetLearningPath(id);

    if (!path || path.userId !== session.user.id) {
        return null;
    }

    return path;
}

export async function getLearningPathForSift(siftId: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        return null;
    }

    const path = await dbGetLearningPathForSift(siftId);

    if (!path || path.userId !== session.user.id) {
        return null;
    }

    return path;
}

// --- Update ---

export async function addSiftToPath(pathId: string, siftId: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Check ownership
    const path = await dbGetLearningPath(pathId);
    if (!path || path.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await dbAddSiftToPath(pathId, siftId);
}

export async function updatePathSummary(pathId: string, newSummary: string, headers: Headers) {
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Check ownership
    const path = await dbGetLearningPath(pathId);
    if (!path || path.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await dbUpdatePathSummary(pathId, newSummary);
}
