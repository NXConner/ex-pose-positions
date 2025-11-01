import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useShared } from "@/hooks/use-shared";
import { withVersion } from "@/services/model-version";
import { setDocSafe, updateDocSafe } from "@/services/db";

export type TonightPlan = {
  poses: number[]; // indices in filteredData
  time?: string;
  place?: string;
  status?: "pending" | "accepted" | "rejected";
  notes?: string;
  updatedAt: number;
};

export function usePlans() {
  const { docId } = useShared();
  const [plan, setPlan] = useState<TonightPlan | null>(null);

  // removed legacy noop binding

  // Re-bind to Firestore from shared to avoid circular dep
  useEffect(() => {
    async function bind() {
      if (!docId) return;
      const { getFirebase } = await import("@/services/firebase");
      const { db } = getFirebase();
      if (!db) return;
      const ref = doc(db, "links", docId, "plans", "current");
      const unsub = onSnapshot(ref, (snap) => {
        setPlan((snap.data() as TonightPlan) || null);
      });
      return () => unsub();
    }
    const cleanupPromise = bind();
    return () => {
      // best-effort cleanup for async
      void cleanupPromise;
    };
  }, [docId]);

  const proposePlan = useCallback(async (draft: Omit<TonightPlan, "updatedAt">) => {
    if (!docId) return;
    const { getFirebase } = await import("@/services/firebase");
    const { db } = getFirebase();
    await setDocSafe(db, ["links", docId, "plans", "current"], withVersion({ ...draft, status: "pending", updatedAt: Date.now() } as TonightPlan));
  }, [docId]);

  const respondPlan = useCallback(async (status: "accepted" | "rejected") => {
    if (!docId) return;
    const { getFirebase } = await import("@/services/firebase");
    const { db } = getFirebase();
    await updateDocSafe(db, ["links", docId, "plans", "current"], withVersion({ status, updatedAt: Date.now() } as any));
  }, [docId]);

  const updateNotes = useCallback(async (notes: string) => {
    if (!docId) return;
    const { getFirebase } = await import("@/services/firebase");
    const { db } = getFirebase();
    await updateDocSafe(db, ["links", docId, "plans", "current"], withVersion({ notes, updatedAt: Date.now() } as any));
  }, [docId]);

  return { plan, proposePlan, respondPlan, updateNotes };
}

