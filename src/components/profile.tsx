import { useEffect, useState } from "react";
import { useShared } from "@/hooks/use-shared";
import { getFirebase } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type StatsDoc = {
  totalPosesTried?: number;
  bestStreak?: number;
  longestSessionMs?: number;
};

export function Profile() {
  const { me, email, partner, shared, docId } = useShared();
  const { db } = getFirebase();
  const [stats, setStats] = useState<StatsDoc | null>(null);

  useEffect(() => {
    if (!db || !docId) return;
    const ref = doc(db, "links", docId, "stats", "couple");
    const unsub = onSnapshot(ref, (snap) => setStats((snap.data() as StatsDoc) || null));
    return () => unsub();
  }, [db, docId]);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Profile</h4>

      <div className="grid gap-2 text-sm">
        <div><span className="text-slate-400">My Email:</span> <span className="text-white select-all">{email || "—"}</span></div>
        <div><span className="text-slate-400">My UID:</span> <span className="text-white select-all">{me || "—"}</span></div>
        <div><span className="text-slate-400">Partner UID:</span> <span className="text-white select-all">{partner || "—"}</span></div>
        <div><span className="text-slate-400">Linked:</span> <span className={shared?.linked ? "text-green-400" : "text-yellow-400"}>{shared?.linked ? "Yes" : "No"}</span></div>
      </div>

      <div className="grid gap-1 text-sm">
        <div className="text-slate-300">Couple Stats (summary)</div>
        <div>Total Poses Tried: <span className="text-white">{stats?.totalPosesTried ?? 0}</span></div>
        <div>Best Streak: <span className="text-white">{stats?.bestStreak ?? 0}</span></div>
        <div>Longest Session (ms): <span className="text-white">{stats?.longestSessionMs ?? 0}</span></div>
      </div>
    </section>
  );
}

