import { ThemeToggle } from "./theme-toggle";
import { useI18n } from "@/i18n";
import { requestNotificationPermission } from "@/services/notifications";
import { useCallback, useState, useEffect } from "react";
import { DevDiagnostics } from "./dev-diagnostics";
import { BackgroundUploader } from "./background-uploader";
import { ThemeCustomizer } from "./theme-customizer";
import { ImageUpload } from "./image-upload";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { useShared } from "@/hooks/use-shared";
import { getFirebase } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type StatsDoc = {
  totalPosesTried?: number;
  bestStreak?: number;
  longestSessionMs?: number;
};

export function Settings() {
  const { locale, setLocale } = useI18n();
  const { me, partner, shared, docId } = useShared();
  const { db } = getFirebase();
  const [stats, setStats] = useState<StatsDoc | null>(null);
  const [flags, setFlags] = useState(() => ({
    partner: (localStorage.getItem("flag_partner") ?? "") || (import.meta.env.VITE_FEATURE_PARTNER ?? "true"),
    tonight: (localStorage.getItem("flag_tonight") ?? "") || (import.meta.env.VITE_FEATURE_TONIGHT ?? "true"),
  }));

  useEffect(() => {
    if (!db || !docId) return;
    const ref = doc(db, "links", docId, "stats", "couple");
    const unsub = onSnapshot(ref, (snap) => setStats((snap.data() as StatsDoc) || null));
    return () => unsub();
  }, [db, docId]);

  const saveFlags = useCallback((k: "partner"|"tonight", v: string) => {
    localStorage.setItem(`flag_${k}`, v);
    setFlags((f) => ({ ...f, [k]: v }));
    location.reload();
  }, []);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-4">
      <h4 className="text-xl neon-accent font-bold">⚙️ Settings</h4>

      {/* Profile Section */}
      <div className="border-b border-slate-700 pb-4">
        <h5 className="text-lg neon-accent mb-3">Profile</h5>
        <div className="grid gap-2 text-sm">
          <div><span className="text-slate-400">My UID:</span> <span className="text-white select-all font-mono text-xs">{me || "—"}</span></div>
          <div><span className="text-slate-400">Partner UID:</span> <span className="text-white select-all font-mono text-xs">{partner || "—"}</span></div>
          <div><span className="text-slate-400">Linked:</span> <span className={shared?.linked ? "text-green-400" : "text-yellow-400"}>{shared?.linked ? "✓ Yes" : "⏳ No"}</span></div>
          {stats && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-slate-300 mb-1">Couple Stats:</div>
              <div>Total Poses: <span className="text-white">{stats.totalPosesTried ?? 0}</span></div>
              <div>Best Streak: <span className="text-white">{stats.bestStreak ?? 0}</span></div>
              <div>Longest Session: <span className="text-white">{Math.floor((stats.longestSessionMs ?? 0) / 1000 / 60)}m</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Section */}
      <div className="border-b border-slate-700 pb-4">
        <h5 className="text-lg neon-accent mb-3">Theme</h5>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm">Theme Preset:</span>
          <ThemeToggle />
        </div>
        <ThemeCustomizer />
      </div>

      {/* Custom Image Upload */}
      <div className="border-b border-slate-700 pb-4">
        <ImageUpload />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">Language:</span>
        <select
          aria-label="Select language"
          className="neon-focus bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-600"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="en-US">English (US)</option>
        </select>
      </div>

      <div className="grid gap-2">
        <div className="text-sm">Feature Flags (local override)</div>
        <div className="flex items-center gap-2 text-sm">
          <label className="min-w-32">Partner:</label>
          <select className="neon-focus bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-600" value={String(flags.partner)} onChange={(e)=>saveFlags("partner", e.target.value)}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="min-w-32">Tonight:</label>
          <select className="neon-focus bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-600" value={String(flags.tonight)} onChange={(e)=>saveFlags("tonight", e.target.value)}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm">Invert position images</label>
        <input
          type="checkbox"
          onChange={(e)=> {
            const on = e.target.checked; localStorage.setItem('invert_positions', on ? '1' : '0'); location.reload();
          }}
          defaultChecked={localStorage.getItem('invert_positions')==='1'}
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>requestNotificationPermission()}>Enable Notifications</button>
        <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>{ localStorage.clear(); sessionStorage.clear(); location.reload(); }}>Clear Local State</button>
      </div>

      <div className="mt-2">
        <div className="text-sm text-slate-300 mb-1">Background (image/video)</div>
        <BackgroundUploader />
      </div>

      <div className="mt-3 grid gap-2">
        <div className="text-sm text-slate-300">Camera Sync Controls</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={localStorage.getItem('cam_local_only')==='1'} onChange={(e)=>localStorage.setItem('cam_local_only', e.target.checked?'1':'0')} />
          Local-only mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={localStorage.getItem('cam_allow_turn')!=='0'} onChange={(e)=>localStorage.setItem('cam_allow_turn', e.target.checked?'1':'0')} />
          Allow TURN relay
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span className="min-w-32">Save location</span>
          <select className="neon-focus bg-slate-800 text-white rounded px-2 py-1" defaultValue={localStorage.getItem('cam_save_mode')||'prompt'} onChange={(e)=>localStorage.setItem('cam_save_mode', e.target.value)}>
            <option value="prompt">Prompt each time</option>
            <option value="auto">Auto-download</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={localStorage.getItem('cam_autodelete')==='1'} onChange={(e)=>localStorage.setItem('cam_autodelete', e.target.checked?'1':'0')} />
          Auto-delete temp blobs after export
        </label>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 border-t border-slate-700 pt-4">
        <KeyboardShortcutsHelp />
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-slate-300">Diagnostics (dev)</summary>
        <DevDiagnostics />
      </details>
    </section>
  );
}

