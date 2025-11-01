import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ensureAnonAuth, getFirebase } from "@/services/firebase";
import { withVersion } from "@/services/model-version";
import { setDocSafe, updateDocSafe } from "@/services/db";

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

export function useShared() {
  const { db } = getFirebase();
  const [me, setMe] = useState<string | null>(null);
  const [partner, setPartner] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(null);
  const [shared, setShared] = useState<SharedDoc | null>(null);

  const features = useMemo(() => ({
    partner: db && import.meta.env.VITE_FEATURE_PARTNER !== "false",
    tonight: db && import.meta.env.VITE_FEATURE_TONIGHT !== "false",
  }), [db]);

  useEffect(() => {
    if (!db) return;
    ensureAnonAuth().then((u) => setMe(u.uid)).catch(() => {});
  }, []);

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
  }, [me, partner]);

  async function savePartner(partnerId: string) {
    if (!me || !partnerId) return;
    const id = pairId(me, partnerId);
    await setDocSafe(db, ["links", id], withVersion({ a: id.split("_")[0], b: id.split("_")[1], linked: true, updatedAt: Date.now() } as SharedDoc));
    setPartner(partnerId);
  }

  async function setRandomPoseId(randomPoseId: number) {
    if (!docId) return;
    await updateDocSafe(db, ["links", docId], withVersion({ randomPoseId, updatedAt: Date.now() } as any));
  }

  return {
    me,
    partner,
    setPartner,
    savePartner,
    docId,
    shared,
    features,
    setRandomPoseId,
  };
}

