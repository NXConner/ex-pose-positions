import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useShared } from "@/hooks/use-shared";
import { getRandomNumber } from "@/utils";
import { getFirebase } from "@/services/firebase";
import { withVersion } from "@/services/model-version";
import { setDocSafe, updateDocSafe } from "@/services/db";

type GameDoc = {
  active: boolean;
  startTime?: number | null;
  streak?: number;
  currentPoseIndex?: number | null;
  updatedAt: number;
};

type StatsDoc = {
  totalPosesTried: number;
  bestStreak: number;
  longestSessionMs: number;
  lastSessionEndedAt?: number;
  updatedAt: number;
};

export function useGame(filteredLength: number) {
  const { docId } = useShared();
  const { db } = getFirebase();
  const [game, setGame] = useState<GameDoc | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!docId || !db) return;
    const unsub = onSnapshot(doc(db, "links", docId, "game", "current"), (snap) => setGame((snap.data() as GameDoc) || null));
    return () => unsub();
  }, [docId]);

  useEffect(() => {
    if (game?.active && game.startTime) {
      timerRef.current && window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setNow(Date.now()), 500) as unknown as number;
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [game?.active, game?.startTime]);

  const elapsedMs = useMemo(() => {
    if (!game?.active || !game.startTime) return 0;
    return Math.max(0, now - game.startTime);
  }, [now, game?.active, game?.startTime]);

  const start = useCallback(async () => {
    if (!docId || filteredLength <= 0) return;
    const startTime = Date.now();
    const currentPoseIndex = getRandomNumber(0, filteredLength - 1);
    await setDocSafe(db, ["links", docId, "game", "current"], withVersion({ active: true, startTime, streak: 1, currentPoseIndex, updatedAt: Date.now() } as GameDoc));
  }, [docId, filteredLength]);

  const nextPose = useCallback(async () => {
    if (!docId || filteredLength <= 0) return;
    const currentPoseIndex = getRandomNumber(0, filteredLength - 1);
    const streak = (game?.streak || 0) + 1;
    await updateDocSafe(db, ["links", docId, "game", "current"], withVersion({ currentPoseIndex, streak, updatedAt: Date.now() } as any));
  }, [docId, filteredLength, game?.streak]);

  const end = useCallback(async () => {
    if (!docId) return;
    const endTime = Date.now();
    const sessionMs = game?.startTime ? endTime - game.startTime : 0;
    const streak = game?.streak || 0;
    await updateDocSafe(db, ["links", docId, "game", "current"], withVersion({ active: false, updatedAt: Date.now() } as any));
    await setDocSafe(db, ["links", docId, "stats", "couple"], withVersion({
        totalPosesTried: (streak > 0 ? streak : 0),
        bestStreak: streak,
        longestSessionMs: sessionMs,
        lastSessionEndedAt: endTime,
        updatedAt: Date.now(),
      } as StatsDoc));
  }, [docId, game?.startTime, game?.streak]);

  return { game, elapsedMs, start, nextPose, end };
}

