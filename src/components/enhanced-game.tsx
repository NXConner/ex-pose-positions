import { useMemo, useState } from "react";
import { useActions } from "@/hooks";
import { useShared } from "@/hooks/use-shared";
import { useGame } from "@/hooks/use-game";
import { throttle } from "@/utils/throttle";
import { getRandomNumber } from "@/utils";
import { hapticPress, hapticSuccess, hapticError } from "@/utils/haptic";

/**
 * Formats milliseconds into a readable time string (MM:SS or HH:MM:SS)
 * @param ms - Milliseconds to format
 * @returns Formatted time string
 */
function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

/**
 * Enhanced Game component with timer, pause/resume, and position tracking
 * Provides a gamified session experience with real-time statistics
 */

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

          // Calculate display time accounting for pauses
          const displayTime = useMemo(() => {
            if (!game?.active || !game.startTime) return 0;
            const now = Date.now();
            const baseTime = elapsedMs;
            
            if (isPaused && pauseStart) {
              // Currently paused: subtract all accumulated pause time + current pause duration
              const currentPauseDuration = now - pauseStart;
              return Math.max(0, baseTime - pausedTime - currentPauseDuration);
            }
            
            // Not paused: subtract only accumulated pause time
            return Math.max(0, baseTime - pausedTime);
          }, [elapsedMs, isPaused, pauseStart, pausedTime, game?.active, game?.startTime]);

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
                    onClick={() => {
                      hapticSuccess();
                      start();
                    }}
                  >
                    🎲 Start New Session
                  </button>
          <div className="mt-4">
                    <button
                      onClick={() => {
                        hapticPress();
                        handleRandomPosition();
                      }}
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
          <div className="flex items-center gap-2 flex-wrap justify-center" role="group" aria-label="Game controls">
                    <button 
                      className="neon-focus bg-green-600 hover:bg-green-700 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
                      onClick={() => {
                        hapticSuccess();
                        throttle(nextPose, 1500)();
                      }}
                      aria-label="Next pose"
                    >
                      <span aria-hidden="true">➡️</span> Next Pose
                    </button>
                    <button 
                      className="neon-focus bg-yellow-600 hover:bg-yellow-700 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
                      onClick={() => {
                        hapticPress();
                        handlePause();
                      }}
                      aria-label={isPaused ? "Resume game" : "Pause game"}
                      aria-pressed={isPaused}
                    >
                      <span aria-hidden="true">{isPaused ? '▶️' : '⏸️'}</span> {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                      className="neon-focus bg-red-700 hover:bg-red-800 duration-200 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
                      onClick={() => {
                        hapticError();
                        end();
                      }}
                      aria-label="End session"
                    >
                      <span aria-hidden="true">⏹️</span> End Session
                    </button>
          </div>
        </div>
      )}
    </section>
  );
}

