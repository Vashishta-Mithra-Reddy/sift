import { db } from "..";
import { pushTokens } from "../schema/push-tokens";
import { eq, and } from "drizzle-orm";

export async function createPushToken(userId: string, data: { token: string; platform?: string; metadata?: any }) {
  // Check if token already exists for this user to avoid duplicates
  const existing = await db.query.pushTokens.findFirst({
    where: and(eq(pushTokens.userId, userId), eq(pushTokens.token, data.token)),
  });

  if (existing) {
    // Update metadata if needed
    await db.update(pushTokens)
      .set({ 
        updatedAt: new Date(),
        platform: data.platform,
        metadata: data.metadata 
      })
      .where(eq(pushTokens.id, existing.id));
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.insert(pushTokens).values({
    id,
    userId,
    token: data.token,
    platform: data.platform,
    metadata: data.metadata,
  });
  return id;
}

export async function deletePushToken(userId: string, token: string) {
  await db.delete(pushTokens).where(
    and(eq(pushTokens.userId, userId), eq(pushTokens.token, token))
  );
}

export async function getPushTokens(userId: string) {
  return await db.query.pushTokens.findMany({
    where: eq(pushTokens.userId, userId),
  });
}
