import "server-only";
import * as admin from "firebase-admin";

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(config: FirebaseAdminConfig) {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: formatPrivateKey(config.privateKey),
    }),
  });
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "[Firebase Admin] Missing credentials. Skipping push notification."
    );
    return null;
  }

  const app = createFirebaseAdminApp({
    projectId,
    clientEmail,
    privateKey,
  });

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
    };

    const response = await app.messaging().send(message);
    console.log("[Firebase Admin] Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("[Firebase Admin] Error sending message:", error);
    return null;
  }
}
