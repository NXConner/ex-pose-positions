import { useMemo, useState } from "react";
import { PHOTO_IDEAS_SOLO_FEMALE, PHOTO_IDEAS_SOLO_MALE, PHOTO_IDEAS_COUPLES, PHOTO_TIPS } from "@/data/photo-ideas";
import { getRandomNumber } from "@/utils";

type Tab = "solo" | "couples" | "tips";

export function PhotoIdeas() {
  const [tab, setTab] = useState<Tab>("solo");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [idea, setIdea] = useState<string>("");

  const currentSolo = useMemo(() => (gender === "male" ? PHOTO_IDEAS_SOLO_MALE : PHOTO_IDEAS_SOLO_FEMALE), [gender]);

  function randomSolo() {
    const idx = getRandomNumber(0, currentSolo.length - 1);
    setIdea(currentSolo[idx]);
  }
  function randomCouples() {
    const idx = getRandomNumber(0, PHOTO_IDEAS_COUPLES.length - 1);
    setIdea(PHOTO_IDEAS_COUPLES[idx]);
  }

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Photo Ideas</h4>

      <div className="flex items-center gap-2">
        <button className={`neon-focus rounded px-3 py-1 ${tab === "solo" ? "bg-pink-700 text-white" : "bg-slate-800 text-white"}`} onClick={() => setTab("solo")}>Solo</button>
        <button className={`neon-focus rounded px-3 py-1 ${tab === "couples" ? "bg-pink-700 text-white" : "bg-slate-800 text-white"}`} onClick={() => setTab("couples")}>Couples</button>
        <button className={`neon-focus rounded px-3 py-1 ${tab === "tips" ? "bg-pink-700 text-white" : "bg-slate-800 text-white"}`} onClick={() => setTab("tips")}>Tips & Tricks</button>
      </div>

      {tab === "solo" && (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm flex items-center gap-1">
              <input type="radio" checked={gender === "female"} onChange={() => setGender("female")}/> Female
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="radio" checked={gender === "male"} onChange={() => setGender("male")}/> Male
            </label>
            <button className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1" onClick={randomSolo}>Random Pose</button>
          </div>
          {idea && <div className="text-sm text-white">{idea}</div>}
        </div>
      )}

      {tab === "couples" && (
        <div className="grid gap-3">
          <button className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1 w-fit" onClick={randomCouples}>Random Pose</button>
          {idea && <div className="text-sm text-white">{idea}</div>}
        </div>
      )}

      {tab === "tips" && (
        <ul className="grid gap-2 list-disc pl-5 text-sm">
          {PHOTO_TIPS.map((t, i) => (
            <li key={i} className="text-slate-200">{t}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

