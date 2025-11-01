import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useShared } from "@/hooks/use-shared";
import { withVersion } from "@/services/model-version";
import { setDocSafe } from "@/services/db";

export const DEFAULT_LISTS = ["Favorites", "Let's Try", "Done It"] as const;

type PoseListsItem = {
  poseId: number; // index from dataset
  lists: string[];
  updatedAt: number;
};

export function useLists() {
  const { me, partner } = useShared();
  const [mine, setMine] = useState<PoseListsItem[]>([]);
  const [theirs, setTheirs] = useState<PoseListsItem[]>([]);

  // Subscribe to my lists
  useEffect(() => {
    async function bind(uid?: string, setter?: (items: PoseListsItem[]) => void) {
      if (!uid || !setter) return;
      const { getFirebase } = await import("@/services/firebase");
      const { db } = getFirebase();
      if (!db) return;
      const col = collection(db, "lists", uid, "items");
      const unsub = onSnapshot(col, (snap) => {
        setter(snap.docs.map((d) => d.data() as PoseListsItem));
      });
      return () => unsub();
    }
    const c1 = bind(me || undefined, setMine);
    return () => { void c1; };
  }, [me]);

  // Subscribe to partner lists
  useEffect(() => {
    async function bind(uid?: string, setter?: (items: PoseListsItem[]) => void) {
      if (!uid || !setter) return;
      const { getFirebase } = await import("@/services/firebase");
      const { db } = getFirebase();
      const col = collection(db, "lists", uid, "items");
      const unsub = onSnapshot(col, (snap) => {
        setter(snap.docs.map((d) => d.data() as PoseListsItem));
      });
      return () => unsub();
    }
    const c2 = bind(partner || undefined, setTheirs);
    return () => { void c2; };
  }, [partner]);

  const merged = useMemo(() => {
    const byPose = new Map<number, Set<string>>();
    for (const it of mine) {
      if (!byPose.has(it.poseId)) byPose.set(it.poseId, new Set());
      it.lists.forEach((l) => byPose.get(it.poseId)!.add(l));
    }
    for (const it of theirs) {
      if (!byPose.has(it.poseId)) byPose.set(it.poseId, new Set());
      it.lists.forEach((l) => byPose.get(it.poseId)!.add(l));
    }
    return Array.from(byPose.entries()).map(([poseId, set]) => ({ poseId, lists: Array.from(set).sort() }));
  }, [mine, theirs]);

  const togglePoseInList = useCallback(async (poseId: number, listName: string, active: boolean) => {
    if (!me) return;
    const { getFirebase } = await import("@/services/firebase");
    const { db } = getFirebase();
    const current = mine.find((x) => x.poseId === poseId);
    const nextLists = current ? [...current.lists] : [];
    const idx = nextLists.indexOf(listName);
    if (active && idx === -1) nextLists.push(listName);
    if (!active && idx !== -1) nextLists.splice(idx, 1);
    await setDocSafe(db, ["lists", me, "items", String(poseId)], withVersion({ poseId, lists: nextLists, updatedAt: Date.now() } as PoseListsItem));
  }, [me, mine]);

  return { mine, theirs, merged, togglePoseInList };
}

