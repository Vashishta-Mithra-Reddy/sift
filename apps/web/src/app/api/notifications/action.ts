"use server";

import { getUserPushTokens } from "@sift/auth/actions/push-tokens";
import { sendPushNotification } from "@/lib/firebase-admin";
import { headers } from "next/headers";

export async function sendSiftReadyNotificationAction(siftId: string, title: string) {
    try {
        const tokens = await getUserPushTokens(await headers());
        if (tokens.length === 0) return;

        const promises = tokens.map(t => 
            sendPushNotification(
                t.token,
                "Sift Ready!",
                `Your sift "${title}" is ready to play.`,
                {
                    type: "SIFT_READY",
                    siftId,
                    link: `/sift/${siftId}/play`
                }
            )
        );

        await Promise.all(promises);
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}
