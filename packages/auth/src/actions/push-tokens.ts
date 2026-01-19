import { createPushToken, deletePushToken } from "@sift/db/queries/push-tokens";
import { auth } from "../index";

export async function registerPushToken(
  data: { token: string; platform?: string; metadata?: any },
  headers: Headers
) {
  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await createPushToken(session.user.id, data);
}

export async function removePushToken(
  token: string,
  headers: Headers
) {
  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await deletePushToken(session.user.id, token);
}
