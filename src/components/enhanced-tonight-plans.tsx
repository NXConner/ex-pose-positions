import { useMemo, useState, useCallback } from "react";
import { usePlans } from "@/hooks/use-plans";
import { useActions } from "@/hooks";
import { PositionsGalleryModal } from "./positions-gallery-modal";
import { getRandomNumber } from "@/utils";
import { sanitizeForFirebase } from "@/utils/sanitize";

type PlanTemplate = {
  name: string;
  poses: number[];
  time?: string;
  place?: string;
};

const TEMPLATES: PlanTemplate[] = [
  { name: "Quick Session", poses: [] },
  { name: "Weekend Special", poses: [] },
  { name: "Adventure Night", poses: [] },
  { name: "Romantic Evening", poses: [] },
];

export function EnhancedTonightPlans() {
  const { plan, proposePlan, respondPlan, updateNotes } = usePlans();
  const { filteredData } = useActions();
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [draftPoses, setDraftPoses] = useState<number[]>([]);
  const [openGallery, setOpenGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");

  const planDetails = useMemo(() => {
    if (!plan) return null;
    const items = (plan.poses || []).map((idx) => filteredData[idx]).filter(Boolean);
    return { items, time: plan.time, place: plan.place, status: plan.status, notes: plan.notes };
  }, [plan, filteredData]);

  const toggleDraft = useCallback((idx: number) => {
    setDraftPoses((cur) => (cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/pose-index');
    const idx = Number(idxStr);
    if (!Number.isFinite(idx)) return;
    toggleDraft(idx);
  }, [toggleDraft]);

  const presetRandom = useCallback((count: number) => {
    const max = filteredData.length - 1;
    const set = new Set<number>();
    while (set.size < Math.min(count, filteredData.length)) {
      set.add(getRandomNumber(0, max));
    }
    setDraftPoses(Array.from(set));
  }, [filteredData]);

  const applyTemplate = useCallback((template: PlanTemplate) => {
    if (template.poses.length > 0) {
      setDraftPoses(template.poses);
    } else {
      presetRandom(3);
    }
    if (template.time) setTime(template.time);
    if (template.place) setPlace(template.place);
    setSelectedTemplate(template.name);
  }, [presetRandom]);

  const handleSendPlan = useCallback(() => {
    if (draftPoses.length === 0) {
      alert('Please add at least one position to your plan');
      return;
    }
    proposePlan({ poses: draftPoses, time, place });
    setDraftPoses([]);
    setTime("");
    setPlace("");
    setNotes("");
    setSelectedTemplate(null);
    alert('Plan sent!');
  }, [draftPoses, time, place, proposePlan]);

  return (
    <section 
      className="w-full neon-card rounded-md p-4 flex flex-col gap-4" 
      onDrop={handleDrop} 
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
    >
      <h4 className="text-xl neon-accent font-bold">💝 Tonight's Plans</h4>

      {/* Template Selection */}
      <div className="grid gap-2">
        <div className="text-sm text-slate-300">Quick Templates</div>
        <div className="flex gap-2 flex-wrap">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className={`neon-focus px-3 py-1 rounded-lg text-sm ${
                selectedTemplate === t.name
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Builder */}
      <div className="grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="datetime-local"
            className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-pink-500 focus:outline-none neon-focus"
            placeholder="When?"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input
            className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-pink-500 focus:outline-none neon-focus"
            placeholder="Where? (optional)"
            value={place}
            onChange={(e) => {
              const sanitized = sanitizeForFirebase(e.target.value, 200);
              setPlace(sanitized || "");
            }}
            maxLength={200}
          />
        </div>

        <textarea
          className="bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-pink-500 focus:outline-none neon-focus min-h-[80px]"
          placeholder="Add notes or special requests..."
          value={notes}
          onChange={(e) => {
            const sanitized = sanitizeForFirebase(e.target.value, 1000);
            setNotes(sanitized || "");
          }}
          maxLength={1000}
        />

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4"
            />
            Recurring plan
          </label>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-3 py-1 text-sm"
          onClick={() => presetRandom(3)}
        >
          🎲 Add 3 Random
        </button>
        <button
          className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-3 py-1 text-sm"
          onClick={() => presetRandom(5)}
        >
          🎲 Add 5 Random
        </button>
        <button
          className="neon-focus bg-purple-600 hover:bg-purple-700 duration-200 text-white rounded-lg px-3 py-1 text-sm"
          onClick={() => setOpenGallery(true)}
        >
          📸 Pick from Gallery
        </button>
      </div>

      {/* Selected Poses */}
      {draftPoses.length > 0 && (
        <div className="grid gap-2">
          <div className="text-sm text-slate-300">
            Selected ({draftPoses.length}):
          </div>
          <div className="flex gap-2 flex-wrap">
            {draftPoses.map((idx) => {
              const item = filteredData[idx];
              if (!item) return null;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1 bg-pink-900/40 border border-pink-500/50 rounded-lg px-2 py-1 text-sm"
                >
                  <span className="text-pink-300">#{item.id}</span>
                  <button
                    onClick={() => toggleDraft(idx)}
                    className="text-pink-300 hover:text-white ml-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendPlan}
        disabled={draftPoses.length === 0}
        className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded-lg px-6 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/50"
      >
        ✉️ Send Plan to Partner
      </button>

      {/* Current Plan Display */}
      {planDetails && (
        <div className="mt-4 p-4 bg-slate-900/60 rounded-lg border border-purple-500/30">
          <div className="text-sm font-semibold text-purple-400 mb-3">Current Plan</div>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-slate-400">Status: </span>
              <span className={`font-semibold ${
                planDetails.status === 'accepted' ? 'text-green-400' :
                planDetails.status === 'rejected' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {planDetails.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Time: </span>
              <span className="text-white">{planDetails.time || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400">Place: </span>
              <span className="text-white">{planDetails.place || '—'}</span>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {planDetails.items.map((it) => (
                <span
                  key={it.id}
                  className="text-xs bg-slate-800 rounded px-2 py-1 border border-slate-600"
                >
                  #{it.id}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                className="neon-focus bg-green-700 hover:bg-green-800 duration-200 text-white rounded-lg px-4 py-2 flex-1"
                onClick={() => respondPlan("accepted")}
              >
                ✅ Yes
              </button>
              <button
                className="neon-focus bg-red-700 hover:bg-red-800 duration-200 text-white rounded-lg px-4 py-2 flex-1"
                onClick={() => respondPlan("rejected")}
              >
                ❌ No
              </button>
            </div>
            <textarea
              className="bg-slate-800 text-white rounded-lg px-3 py-2 mt-2 border border-slate-600 focus:border-pink-500 focus:outline-none neon-focus"
              placeholder="Add your response notes..."
              defaultValue={planDetails.notes || ""}
              onBlur={(e) => updateNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      <PositionsGalleryModal
        open={openGallery}
        onClose={() => setOpenGallery(false)}
        onSelect={(selectedIds) => {
          const selectedIndices = selectedIds
            .map(id => filteredData.findIndex(p => p.id === id))
            .filter(idx => idx !== -1 && !draftPoses.includes(idx));
          setDraftPoses(current => [...current, ...selectedIndices]);
        }}
        initialSelected={draftPoses.map(idx => filteredData[idx]?.id).filter(Boolean) as number[]}
      />
    </section>
  );
}

