import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "@/config/env";

// Use validated config from env.ts
const firebaseConfig = env.firebase;

/**
 * Checks if Firebase configuration is valid
 * @returns true if all required config values are present
 */
function isValidConfig(): boolean {
  return Boolean(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId);
}

/**
 * Gets Firebase app, auth, and firestore instances
 * @returns Object containing app, auth, and db instances (or null if not configured)
 */
export function getFirebase() {
  if (!isValidConfig()) {
    return { app: null as any, auth: null as any, db: null as any };
  }
  const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

/**
 * Ensures anonymous authentication is set up
 * @returns Promise resolving to the authenticated User
 * @throws Error if Firebase auth is not configured
 */
export async function ensureAnonAuth(): Promise<User> {
  const { auth } = getFirebase();
  if (!auth) throw new Error("Firebase auth not configured");
  if (auth.currentUser) return auth.currentUser;
  await signInAnonymously(auth);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        unsub();
        resolve(u);
      }
    });
  });
}

