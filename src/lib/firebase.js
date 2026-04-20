import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mock-url.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
};

// Check if we actually have valid config to avoid real connection errors if fallback happens
export const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-key";

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase initialization failed", e);
  }
} else {
  app = getApps()[0];
}

export const db = app ? getDatabase(app) : null;
