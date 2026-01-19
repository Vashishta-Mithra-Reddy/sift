"use server";

import { registerPushToken, removePushToken } from "@sift/auth/actions/push-tokens";
import { headers } from "next/headers";

export async function savePushTokenAction(token: string, platform: string = "web") {
  const requestHeaders = await headers();
  // We can gather more metadata here from headers if needed (User-Agent, etc.)
  const userAgent = requestHeaders.get("user-agent") || "unknown";
  
  const metadata = {
    userAgent,
    lastSeen: new Date().toISOString(),
  };

  return await registerPushToken({ token, platform, metadata }, requestHeaders);
}

export async function removePushTokenAction(token: string) {
  const requestHeaders = await headers();
  return await removePushToken(token, requestHeaders);
}
