import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useShared } from "@/hooks/use-shared";
import { getFirebase } from "@/services/firebase";

type StatsDoc = {
  totalPosesTried: number;
  bestStreak: number;
  longestSessionMs: number;
  lastSessionEndedAt?: number;
  updatedAt: number;
};

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function Stats() {
  const { docId } = useShared();
  const { db } = getFirebase();
  const [stats, setStats] = useState<StatsDoc | null>(null);

  useEffect(() => {
    if (!docId) return;
    const ref = doc(db, "links", docId, "stats", "couple");
    const unsub = onSnapshot(ref, (snap) => setStats((snap.data() as StatsDoc) || null));
    return () => unsub();
  }, [docId]);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Couples Stats & Achievements</h4>
      {!stats && <div className="text-sm text-slate-400">No stats yet. Complete a game session to see records.</div>}
      {stats && (
        <div className="grid gap-2 text-sm">
          <div>Total Poses Tried: <span className="text-white">{stats.totalPosesTried || 0}</span></div>
          <div>Best Streak: <span className="text-white">{stats.bestStreak || 0}</span></div>
          <div>Longest Session: <span className="text-white">{formatMs(stats.longestSessionMs || 0)}</span></div>
        </div>
      )}
    </section>
  );
}

