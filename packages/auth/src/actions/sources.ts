import { createSource as dbCreateSource, getSources as dbGetSources, getSource as dbGetSource, deleteSource as dbDeleteSource, type CreateSourceInput } from "@sift/db/queries/sources";
import { auth } from "../index";
import type { Source, SourceWithSifts } from "@sift/db/types";

export async function createSource(data: CreateSourceInput, headers: Headers): Promise<string> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await dbCreateSource(session.user.id, data);
}

export async function getSources(headers: Headers): Promise<SourceWithSifts[]> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await dbGetSources(session.user.id);
}

export async function getSource(id: string, headers: Headers): Promise<Source | undefined> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const source = await dbGetSource(id);
  
  if (source && source.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return source;
}

export async function deleteSource(id: string, headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
  
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
  
    // Verify ownership
    const source = await dbGetSource(id);
    if (!source) return;
    
    if (source.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }
  
    await dbDeleteSource(id);
    return { success: true };
  }
