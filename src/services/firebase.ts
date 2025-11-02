import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "@/config/env";

// Use validated config from env.ts
const firebaseConfig = env.firebase;

function isValidConfig() {
  return Boolean(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId);
}

export function getFirebase() {
  if (!isValidConfig()) {
    return { app: null as any, auth: null as any, db: null as any };
  }
  const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

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

