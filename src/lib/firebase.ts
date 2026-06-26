import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase Web config – publishable keys (safe to ship in client).
// In production, all of these can be overridden via VITE_FIREBASE_* env vars.
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyACMI-ZXaukQoWWpkMAUKdkLyN8_XMb0FE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "jai-bharat-junior-colleg-4bf3f.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "jai-bharat-junior-colleg-4bf3f",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "jai-bharat-junior-colleg-4bf3f.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "931204710014",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:931204710014:web:a7dcb81a37d36e1716222f",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-80X9E4PDFD",
};

// Web Push VAPID key – set in Firebase Console → Project Settings → Cloud Messaging.
// Add to deployment env as VITE_FCM_VAPID_KEY. Push is inert until set.
export const FCM_VAPID_KEY: string = env.VITE_FCM_VAPID_KEY ?? "";

export const ADMIN_EMAILS = ["jaibharatappp@gmail.com"];

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase is only available in the browser");
  }
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return { app: _app!, auth: _auth!, db: _db! };
}