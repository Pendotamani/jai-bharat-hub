import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACMI-ZXaukQoWWpkMAUKdkLyN8_XMb0FE",
  authDomain: "jai-bharat-junior-colleg-4bf3f.firebaseapp.com",
  projectId: "jai-bharat-junior-colleg-4bf3f",
  storageBucket: "jai-bharat-junior-colleg-4bf3f.firebasestorage.app",
  messagingSenderId: "931204710014",
  appId: "1:931204710014:web:a7dcb81a37d36e1716222f",
  measurementId: "G-80X9E4PDFD",
};

// IMPORTANT: Replace with your Firebase Web Push VAPID key
// Get it from: Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
export const FCM_VAPID_KEY = "REPLACE_WITH_YOUR_VAPID_KEY";

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