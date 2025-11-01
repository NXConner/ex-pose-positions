import { useCallback } from "react";
import { useActions } from "@/hooks";
import { useGame } from "@/hooks/use-game";
import { useShared } from "@/hooks/use-shared";
import { getRandomNumber } from "@/utils";

export function RandomDice() {
  const { filteredData, setPositionId } = useActions();
  const { features } = useShared();
  const { game, start, nextPose } = useGame(filteredData.length);

  const onClick = useCallback(() => {
    if (features.tonight) {
      if (game?.active) nextPose();
      else start();
      return;
    }
    if (filteredData.length > 0) {
      const idx = getRandomNumber(0, filteredData.length - 1);
      setPositionId(idx);
    }
  }, [features.tonight, game?.active, filteredData]);

  return (
    <button
      aria-label="Random / Next"
      title="Random / Next"
      onClick={onClick}
      className="neon-focus bg-pink-700 hover:bg-pink-800 text-white rounded-full h-9 px-3 flex items-center justify-center"
    >
      <span className="text-lg">🎲</span>
    </button>
  );
}

