import { getFirebase, FCM_VAPID_KEY } from "./firebase";

const LOGO_ICON = "/__l5e/assets-v1/d5019651-1c85-4326-b4f0-93939e88ff93/college-logo.jpeg";

/**
 * Request notification permission, get the FCM token, store it in Firestore
 * (deduped by token id), and wire up foreground message display.
 * Returns the token, or null if unavailable / denied / not configured.
 */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
  if (!FCM_VAPID_KEY) {
    console.info("FCM: VAPID key not configured (set VITE_FCM_VAPID_KEY). Push disabled.");
    return null;
  }
  if (Notification.permission === "denied") return null;

  try {
    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    if (permission !== "granted") return null;

    const { getMessaging, getToken, onMessage, isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) return null;

    const { app, db } = getFirebase();
    const messaging = getMessaging(app);

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return null;

    // Persist token (dedupe via doc-id == token)
    try {
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      await setDoc(
        doc(db, "fcm_tokens", token),
        { token, userAgent: navigator.userAgent, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (e) {
      console.warn("FCM: could not persist token", e);
    }

    onMessage(messaging, (payload) => {
      const n = payload.notification;
      if (!n) return;
      try {
        new Notification(n.title ?? "New notice", { body: n.body, icon: LOGO_ICON });
      } catch {
        // ignore – some browsers restrict Notification constructor
      }
    });

    return token;
  } catch (e) {
    console.error("FCM init failed:", e);
    return null;
  }
}