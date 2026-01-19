"use client";

import { useEffect, useState, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { savePushTokenAction, removePushTokenAction } from "@/app/push-actions";

export function useFCM(options: { preventInit?: boolean } = {}) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const tokenSentRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);

      // Listen for permission changes via Permissions API
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'notifications' }).then((status) => {
          status.onchange = () => {
            setPermission(Notification.permission);
          };
        });
      }
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      return status;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return "denied";
    }
  };

  useEffect(() => {
    async function setupFCM() {
      if (options.preventInit || !session?.user || permission !== "granted") return;
      
      console.log("[FCM] Initializing...");
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.error("[FCM] Messaging not supported");
        toast.error("Push notifications are not supported on this device/browser.");
        return;
      }

      try {
        let serviceWorkerRegistration = undefined;
        
        if ("serviceWorker" in navigator) {
          serviceWorkerRegistration = await navigator.serviceWorker.ready;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey) {
            console.error("[FCM] Missing NEXT_PUBLIC_VAPID_KEY");
            toast.error("Push notification configuration is missing (VAPID Key).");
            return;
        }

        console.log("[FCM] Getting token...");
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration,
        });

        if (token) {
          // Check if we already sent this token for this user
          if (token !== tokenSentRef.current || session.user.id !== userIdRef.current) {
            console.log("[FCM] Token generated, saving to server...", token.slice(0, 10) + "...");
            try {
              const result = await savePushTokenAction(token, "web");
              if (result) {
                console.log("[FCM] Token saved successfully");
                tokenSentRef.current = token;
                userIdRef.current = session.user.id;
                localStorage.setItem("fcm_enabled", "true");
                localStorage.setItem("fcm_token", token);
              }
            } catch (error) {
              console.error("[FCM] Failed to save token to server", error);
            }
          }
        } else {
            console.warn("[FCM] No token received");
        }

        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);

          // Show in-app toast
          toast(payload.notification?.title || "New Notification", {
            description: payload.notification?.body,
            action: payload.data?.link ? {
              label: "View",
              onClick: () => {
                const link = payload.data?.link;
                if (link) router.push(link as any);
              }
            } : undefined,
          });

          // Show system notification if supported (even if app is in foreground)
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(payload.notification?.title || "New Notification", {
                body: payload.notification?.body,
                icon: '/favicon/web-app-manifest-192x192.png',
                badge: '/favicon/web-app-manifest-192x192.png',
                data: payload.data,
                actions: payload.data?.link ? [{
                  action: 'view',
                  title: 'View'
                }] : []
              } as any);
            });
          }
        });
      } catch (error) {
        console.error("FCM setup failed:", error);
        toast.error("Failed to enable notifications", {
            description: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    }

    setupFCM();
  }, [permission, options.preventInit]);

  const unregister = async () => {
    const tokenToRemove = fcmToken || (typeof window !== "undefined" ? localStorage.getItem("fcm_token") : null);
    
    if (tokenToRemove) {
      try {
        await removePushTokenAction(tokenToRemove);
        setFcmToken(null);
        tokenSentRef.current = null; // Reset sent ref so we can register again if needed
        console.log("[FCM] Token removed from server");
      } catch (error) {
        console.error("[FCM] Failed to remove token:", error);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("fcm_token");
      localStorage.setItem("fcm_enabled", "false");
    }
  };

  return { permission, requestPermission, unregister };
}
