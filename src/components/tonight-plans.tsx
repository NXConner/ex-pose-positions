import { useMemo, useState } from "react";
import { usePlans } from "@/hooks/use-plans";
import { useActions } from "@/hooks";

export function TonightPlans() {
  const { plan, proposePlan, respondPlan, updateNotes } = usePlans();
  const { filteredData } = useActions();
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [draftPoses, setDraftPoses] = useState<number[]>([]);

  const planDetails = useMemo(() => {
    if (!plan) return null;
    const items = (plan.poses || []).map((idx) => filteredData[idx]).filter(Boolean);
    return { items, time: plan.time, place: plan.place, status: plan.status, notes: plan.notes };
  }, [plan, filteredData]);

  function toggleDraft(idx: number) {
    setDraftPoses((cur) => (cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/pose-index');
    const idx = Number(idxStr);
    if (!Number.isFinite(idx)) return;
    toggleDraft(idx);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }

  function preset(n: number) {
    const max = filteredData.length - 1;
    const set = new Set<number>();
    while (set.size < Math.min(n, filteredData.length)) {
      set.add(Math.floor(Math.random() * (max + 1)));
    }
    setDraftPoses(Array.from(set));
  }

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3" onDrop={onDrop} onDragOver={onDragOver}>
      <h4 className="text-lg neon-accent">Tonight's Plans</h4>

      <div className="text-sm grid gap-2">
        <div className="flex gap-2">
          <input type="datetime-local" className="bg-slate-900 text-white rounded px-2 py-1 w-full" placeholder="Optional time" value={time} onChange={(e) => setTime(e.target.value)} />
          <input className="bg-slate-900 text-white rounded px-2 py-1 w-full" placeholder="Optional place" value={place} onChange={(e) => setPlace(e.target.value)} />
          <button
            className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1"
            onClick={() => proposePlan({ poses: draftPoses, time, place })}
          >
            Send Plan
          </button>
          <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>preset(3)}>Preset 3</button>
          <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>preset(5)}>Preset 5</button>
          <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>setPickerOpen(true)}>Pick from Gallery</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filteredData.slice(0, 12).map((item, idx) => (
            <button
              key={item.id}
              className={`text-xs rounded px-2 py-1 border ${draftPoses.includes(idx) ? "border-pink-500 text-pink-300" : "border-slate-700 text-slate-300"}`}
              onClick={() => toggleDraft(idx)}
              title={item.title}
            >
              Add #{item.id}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 text-sm">
        <div className="mb-1">Current Plan</div>
        {!planDetails && <div className="text-slate-400">No plan yet</div>}
        {planDetails && (
          <div className="grid gap-2">
            <div>Status: <span className="text-white">{planDetails.status || "pending"}</span></div>
            <div>Time/Place: <span className="text-white">{planDetails.time || "—"} / {planDetails.place || "—"}</span></div>
            <div className="flex gap-1 flex-wrap">
              {planDetails.items.map((it) => (
                <span key={it.id} className="text-xs bg-slate-800 rounded px-2 py-0.5">#{it.id}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="neon-focus bg-green-700 text-white rounded px-3 py-1" onClick={() => respondPlan("accepted")}>Yes</button>
              <button className="neon-focus bg-red-700 text-white rounded px-3 py-1" onClick={() => respondPlan("rejected")}>No</button>
            </div>
            <textarea
              className="bg-slate-900 text-white rounded px-2 py-1 w-full"
              placeholder="Add notes..."
              defaultValue={planDetails.notes || ""}
              onBlur={(e) => updateNotes(e.target.value)}
            />
          </div>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="neon-card rounded-md p-4 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="neon-accent">Select positions</div>
              <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>setPickerOpen(false)}>Close</button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-auto">
              {filteredData.map((it, idx)=> (
                <label key={it.id} className="relative bg-slate-900/50 rounded">
                  <input type="checkbox" className="absolute top-2 left-2" checked={draftPoses.includes(idx)} onChange={()=>toggleDraft(idx)} />
                  <img src={`images/positions/${it.fileName}`} alt={it.title} className="w-full h-28 object-cover rounded" />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

