import { getFirebase, FCM_VAPID_KEY } from "./firebase";

/**
 * Request notification permission and get the FCM token.
 * Returns the token string or null if unavailable / denied.
 *
 * IMPORTANT: Set your VAPID key in src/lib/firebase.ts (FCM_VAPID_KEY).
 * Also ensure public/firebase-messaging-sw.js has the Firebase config.
 */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
  if (FCM_VAPID_KEY === "REPLACE_WITH_YOUR_VAPID_KEY") {
    console.warn("FCM: VAPID key not configured. Skipping push registration.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const { getMessaging, getToken, onMessage } = await import("firebase/messaging");
    const { app } = getFirebase();
    const messaging = getMessaging(app);

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    onMessage(messaging, (payload) => {
      console.log("Foreground FCM message:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title ?? "New notice", {
          body: payload.notification.body,
          icon: "/__l5e/assets-v1/d5019651-1c85-4326-b4f0-93939e88ff93/college-logo.jpeg",
        });
      }
    });

    return token;
  } catch (e) {
    console.error("FCM init failed:", e);
    return null;
  }
}