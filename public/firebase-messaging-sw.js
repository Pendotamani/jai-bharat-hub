/* Firebase Cloud Messaging service worker
 * The VAPID key is set on the client (src/lib/firebase.ts -> FCM_VAPID_KEY).
 * Update firebaseConfig below if you change Firebase projects. */
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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "New Notice";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "/__l5e/assets-v1/d5019651-1c85-4326-b4f0-93939e88ff93/college-logo.jpeg",
    badge: "/__l5e/assets-v1/d5019651-1c85-4326-b4f0-93939e88ff93/college-logo.jpeg",
  };
  self.registration.showNotification(title, options);
});