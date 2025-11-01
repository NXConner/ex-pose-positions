import { useMemo } from "react";
import { useActions } from "@/hooks";
import { useShared } from "@/hooks/use-shared";
import { useGame } from "@/hooks/use-game";
import { throttle } from "@/utils/throttle";

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function Game() {
  const { filteredData } = useActions();
  const { features } = useShared();
  const { game, elapsedMs, start, nextPose, end } = useGame(filteredData.length);

  if (!features.tonight) return null;

  const pose = useMemo(() => {
    if (!game?.currentPoseIndex && game?.currentPoseIndex !== 0) return null;
    return filteredData[game.currentPoseIndex] || null;
  }, [game?.currentPoseIndex, filteredData]);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Game</h4>
      {!game?.active && (
        <div className="flex items-center gap-2">
          <button className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1" onClick={start}>Start New Session</button>
        </div>
      )}

      {game?.active && (
        <div className="grid gap-3">
          <div className="text-sm text-slate-300">Timer: <span className="text-white">{formatMs(elapsedMs)}</span></div>
          <div className="text-sm text-slate-300">Streak: <span className="text-white">{game?.streak || 0}</span></div>
          {pose && (
            <div className="flex items-center gap-3">
              <img alt={pose.title} src={`images/positions/${pose.fileName}`} className="h-24 rounded" loading="lazy" decoding="async" />
              <div className="text-white text-sm">#{pose.id} {pose.title}</div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={throttle(nextPose, 1500)}>Next Pose</button>
            <button className="neon-focus bg-red-700 text-white rounded px-3 py-1" onClick={end}>End Session</button>
          </div>
        </div>
      )}
    </section>
  );
}

