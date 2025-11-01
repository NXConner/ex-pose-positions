import { ThemeToggle } from "./theme-toggle";
import { useI18n } from "@/i18n";
import { requestNotificationPermission } from "@/services/notifications";
import { useCallback, useState } from "react";
import { DevDiagnostics } from "./dev-diagnostics";
import { BackgroundUploader } from "./background-uploader";

export function Settings() {
  const { locale, setLocale } = useI18n();
  const [flags, setFlags] = useState(() => ({
    partner: (localStorage.getItem("flag_partner") ?? "") || (import.meta.env.VITE_FEATURE_PARTNER ?? "true"),
    tonight: (localStorage.getItem("flag_tonight") ?? "") || (import.meta.env.VITE_FEATURE_TONIGHT ?? "true"),
  }));

  const saveFlags = useCallback((k: "partner"|"tonight", v: string) => {
    localStorage.setItem(`flag_${k}`, v);
    setFlags((f) => ({ ...f, [k]: v }));
    location.reload();
  }, []);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Settings</h4>

      <div className="flex items-center gap-3">
        <span className="text-sm">Theme:</span>
        <ThemeToggle />
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

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-slate-300">Diagnostics (dev)</summary>
        <DevDiagnostics />
      </details>
    </section>
  );
}

