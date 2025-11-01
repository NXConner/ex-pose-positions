import { useEffect, useMemo, useState } from "react";
import { useShared } from "@/hooks/use-shared";
import { useActions } from "@/hooks";
import { getRandomNumber } from "@/utils";
import { throttle } from "@/utils/throttle";
import { PoseModal } from "./pose-modal";

export function Tonight() {
  const { shared, setRandomPoseId, features } = useShared();
  const { filteredData } = useActions();
  const [open, setOpen] = useState(false);

  const sharedIndex = shared?.randomPoseId ?? null;
  const sharedPose = useMemo(() => {
    if (sharedIndex == null) return null;
    return filteredData[sharedIndex] ?? null;
  }, [sharedIndex, filteredData]);

  useEffect(() => {
    if (sharedPose) setOpen(true);
  }, [sharedPose?.id]);

  const triggerRandom = useMemo(() => throttle(() => {
    const idx = getRandomNumber(0, filteredData.length - 1);
    setRandomPoseId(idx);
  }, 1500), [filteredData]);

  if (!features.tonight) return null;

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Tonight</h4>
      <p className="text-sm text-slate-300">Shared randomizer</p>
      <div>
        <button
          onClick={triggerRandom}
          className="bg-pink-600 cursor-pointer hover:bg-purple-700 duration-300 text-white rounded-md shadow-md hover:shadow-lg leading-8 px-4 py-1"
        >
          Show Us Another
        </button>
      </div>

      <PoseModal
        open={open && !!sharedPose}
        onClose={() => setOpen(false)}
        imageSrc={sharedPose ? `images/positions/${sharedPose.fileName}` : ""}
        title={sharedPose ? sharedPose.title : ""}
      />
    </section>
  );
}

