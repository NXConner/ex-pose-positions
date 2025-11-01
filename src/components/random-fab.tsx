import { useCallback } from "react";
import { useActions } from "@/hooks";
import { useGame } from "@/hooks/use-game";

export function RandomFab() {
  const { filteredData } = useActions();
  const { game, start, nextPose } = useGame(filteredData.length);

  const onClick = useCallback(() => {
    if (game?.active) {
      nextPose();
    } else {
      start();
    }
  }, [game?.active, start, nextPose]);

  return (
    <button
      aria-label={game?.active ? "Next Pose" : "Start Game"}
      title={game?.active ? "Next Pose" : "Start Game"}
      onClick={onClick}
      className="fixed top-20 right-6 z-50 rounded-full h-14 w-14 flex items-center justify-center text-white shadow-lg neon-focus"
      style={{ background: 'var(--accent)' }}
    >
      <span className="text-2xl">🎲</span>
    </button>
  );
}

