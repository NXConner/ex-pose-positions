import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ensureAnonAuth, getFirebase } from "@/services/firebase";
import { withVersion } from "@/services/model-version";
import { setDocSafe, updateDocSafe } from "@/services/db";
import { getUserProfile, saveUserEmail } from "@/services/user-profile";
import { sanitizeForFirebase, validateEmail } from "@/utils/sanitize";
import { logger } from "@/services/logging";

type SharedDoc = {
  a: string; // user A uid (sorted)
  b: string; // user B uid (sorted)
  linked: boolean;
  randomPoseId?: number | null;
  updatedAt: number;
};

function pairId(uidA: string, uidB: string) {
  const [min, max] = [uidA, uidB].sort();
  return `${min}_${max}`;
}

type SaveEmailResult =
  | { ok: true; profile: Awaited<ReturnType<typeof saveUserEmail>> }
  | { ok: false; error: string };

export function useShared() {
  const { db } = getFirebase();
  const [me, setMe] = useState<string | null>(null);
  const [partner, setPartner] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(null);
  const [shared, setShared] = useState<SharedDoc | null>(null);

  const features = useMemo(() => ({
    partner: db && import.meta.env.VITE_FEATURE_PARTNER !== "false",
    tonight: db && import.meta.env.VITE_FEATURE_TONIGHT !== "false",
  }), [db]);

  useEffect(() => {
    if (!db) return;
    let active = true;
    ensureAnonAuth()
      .then(async (u) => {
        if (!active) return;
        setMe(u.uid);
        try {
          const profile = await getUserProfile(db, u.uid);
          if (profile?.email && active) {
            setEmail(profile.email);
          }
        } catch (error) {
          logger.warn("load-user-profile-failed", { error: String(error) });
        }
      })
      .catch((error) => {
        logger.error("ensure-anon-auth-failed", { error: String(error) });
      });
    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    if (!db || !me || !partner) {
      setDocId(null);
      setShared(null);
      return;
    }
    const id = pairId(me, partner);
    setDocId(id);
    const ref = doc(db, "links", id);
    const unsub = onSnapshot(ref, (snap) => {
      setShared((snap.data() as SharedDoc) || null);
    });
    return () => unsub();
  }, [db, me, partner]);

  const savePartner = useCallback(
    async (partnerId: string) => {
      if (!db || !me || !partnerId) return;
      const sanitized = sanitizeForFirebase(partnerId, 200);
      if (!sanitized) return;
      const id = pairId(me, sanitized);
      await setDocSafe(
        db,
        ["links", id],
        withVersion({ a: id.split("_")[0], b: id.split("_")[1], linked: true, updatedAt: Date.now() } as SharedDoc)
      );
      setPartner(sanitized);
    },
    [db, me]
  );

  const saveEmailAddress = useCallback(
    async (nextEmail: string): Promise<SaveEmailResult> => {
      if (!db || !me) {
        return { ok: false, error: "Not authenticated" };
      }
      const sanitized = sanitizeForFirebase(nextEmail, 254);
      if (!sanitized || !validateEmail(sanitized)) {
        return { ok: false, error: "Please enter a valid email address." };
      }
      try {
        const profile = await saveUserEmail(db, me, sanitized);
        setEmail(profile.email);
        return { ok: true, profile };
      } catch (error) {
        logger.error("save-email-address-failed", { error: String(error) });
        return { ok: false, error: "Unable to save email right now. Please try again." };
      }
    },
    [db, me]
  );

  const setRandomPoseId = useCallback(
    async (randomPoseId: number) => {
      if (!db || !docId) return;
      await updateDocSafe(db, ["links", docId], withVersion({ randomPoseId, updatedAt: Date.now() } as any));
    },
    [db, docId]
  );

  return {
    me,
    email,
    partner,
    setPartner,
    savePartner,
    docId,
    shared,
    features,
    setRandomPoseId,
    saveEmail: saveEmailAddress,
  };
}

