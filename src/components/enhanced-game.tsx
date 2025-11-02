import { useMemo, useState } from "react";
import { useActions } from "@/hooks";
import { useShared } from "@/hooks/use-shared";
import { useGame } from "@/hooks/use-game";
import { throttle } from "@/utils/throttle";
import { getRandomNumber } from "@/utils";

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

export function EnhancedGame() {
  const { filteredData, setPositionId } = useActions();
  const { features } = useShared();
  const { game, elapsedMs, start, nextPose, end } = useGame(filteredData.length);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);

  const pose = useMemo(() => {
    if (!game?.currentPoseIndex && game?.currentPoseIndex !== 0) return null;
    return filteredData[game.currentPoseIndex] || null;
  }, [game?.currentPoseIndex, filteredData]);

  const handleRandomPosition = useMemo(() => {
    return throttle(() => {
      if (filteredData.length > 0) {
        const next = getRandomNumber(0, filteredData.length - 1);
        setPositionId(next);
      }
    }, 500);
  }, [filteredData, setPositionId]);

  const handlePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (pauseStart) {
        setPausedTime(prev => prev + (Date.now() - pauseStart));
        setPauseStart(null);
      }
    } else {
      setIsPaused(true);
      setPauseStart(Date.now());
    }
  };

  const displayTime = isPaused && pauseStart ? elapsedMs : elapsedMs - pausedTime;

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-2xl neon-accent font-bold text-center mb-2">🎮 Game Session</h4>
      
      {!game?.active && (
        <div className="text-center">
          <div className="mb-4 text-slate-300">
            Start a game session to track your time and poses tried!
          </div>
          <button 
            className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded-lg px-6 py-3 text-lg font-semibold shadow-lg shadow-pink-500/50"
            onClick={start}
          >
            🎲 Start New Session
          </button>
          <div className="mt-4">
            <button
              onClick={handleRandomPosition}
              className="neon-focus bg-purple-600 hover:bg-purple-700 duration-200 text-white rounded-lg px-4 py-2 text-sm"
            >
              🎯 Get Random Position
            </button>
          </div>
        </div>
      )}

      {game?.active && (
        <div className="grid gap-4">
          {/* Large Timer Display */}
          <div className="text-center p-6 bg-slate-900/60 rounded-lg border border-pink-500/30">
            <div className="text-5xl font-bold neon-accent mb-2 font-mono">
              {formatMs(Math.max(0, displayTime))}
            </div>
            <div className="text-sm text-slate-400">Session Duration</div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 rounded-lg p-3 text-center border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{game?.streak || 0}</div>
              <div className="text-xs text-slate-400">Poses Tried</div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">
                {pose ? `#${pose.id}` : '—'}
              </div>
              <div className="text-xs text-slate-400">Current Position</div>
            </div>
          </div>

          {/* Current Pose Display */}
          {pose && (
            <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-lg border border-blue-500/30">
              <img 
                alt={pose.title} 
                src={`images/positions/${pose.fileName}`} 
                className="h-32 w-32 object-cover rounded-lg shadow-lg"
                loading="lazy" 
                decoding="async"
              />
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">#{pose.id}</div>
                <div className="text-slate-300 text-sm">{pose.title}</div>
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button 
              className="neon-focus bg-green-600 hover:bg-green-700 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
              onClick={throttle(nextPose, 1500)}
            >
              ➡️ Next Pose
            </button>
            <button 
              className="neon-focus bg-yellow-600 hover:bg-yellow-700 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
              onClick={handlePause}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button 
              className="neon-focus bg-red-700 hover:bg-red-800 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
              onClick={end}
            >
              ⏹️ End Session
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

