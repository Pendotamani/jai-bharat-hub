/* Firebase Cloud Messaging service worker
 * Background push handler. Service workers can't read import.meta.env,
 * so the publishable Firebase web config is inlined here.
 * (These are NOT secrets — same values exist in the client bundle.) */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyACMI-ZXaukQoWWpkMAUKdkLyN8_XMb0FE",
  authDomain: "jai-bharat-junior-colleg-4bf3f.firebaseapp.com",
  projectId: "jai-bharat-junior-colleg-4bf3f",
  storageBucket: "jai-bharat-junior-colleg-4bf3f.firebasestorage.app",
  messagingSenderId: "931204710014",
  appId: "1:931204710014:web:a7dcb81a37d36e1716222f",
});

const ICON = "/__l5e/assets-v1/d5019651-1c85-4326-b4f0-93939e88ff93/college-logo.jpeg";
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = (payload && payload.notification) || {};
  const data = (payload && payload.data) || {};
  const title = n.title || data.title || "New Notice";
  const options = {
    body: n.body || data.body || "",
    icon: ICON,
    badge: ICON,
    data: { url: data.url || "/notices" },
    tag: "jb-notice",
    renotify: true,
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/notices";
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of allClients) {
      try {
        const url = new URL(client.url);
        if (url.pathname === targetUrl) {
          await client.focus();
          return;
        }
      } catch { /* ignore */ }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});