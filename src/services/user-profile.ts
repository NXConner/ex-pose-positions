import { logger } from "@/services/logging";
import { withVersion, MODEL_VERSION } from "@/services/model-version";
import { setDocSafe } from "@/services/db";

const COLLECTION = "users";

type UserProfileBase = {
  uid: string;
  email: string;
  emailNormalized: string;
  createdAt: number;
  updatedAt: number;
};

export type UserProfile = UserProfileBase & { schemaVersion: number };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserProfile(db: any, uid: string): Promise<UserProfile | null> {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as Partial<UserProfile>;
    const createdAt = typeof data.createdAt === "number" ? data.createdAt : Date.now();
    const updatedAt = typeof data.updatedAt === "number" ? data.updatedAt : Date.now();
    const email = typeof data.email === "string" ? data.email : "";
    const emailNormalized = typeof data.emailNormalized === "string" ? data.emailNormalized : normalizeEmail(email);
    const schemaVersion = typeof data.schemaVersion === "number" ? data.schemaVersion : MODEL_VERSION;

    return {
      uid,
      email,
      emailNormalized,
      createdAt,
      updatedAt,
      schemaVersion,
    };
  } catch (error) {
    logger.warn("user-profile-read-failed", { error: String(error) });
    return null;
  }
}

export async function saveUserEmail(db: any, uid: string, email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const now = Date.now();

  let createdAt = now;
  try {
    const existing = await getUserProfile(db, uid);
    if (existing?.createdAt) {
      createdAt = existing.createdAt;
    }
  } catch (error) {
    logger.warn("user-profile-existing-fetch-failed", { error: String(error) });
  }

  const profile = withVersion<UserProfileBase>({
    uid,
    email,
    emailNormalized: normalized,
    createdAt,
    updatedAt: now,
  });

  try {
    await setDocSafe(db, [COLLECTION, uid], profile);
  } catch (error) {
    logger.error("user-profile-save-failed", { error: String(error) });
    throw error;
  }

  return profile;
}

