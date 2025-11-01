import { useEffect, useState } from "react";
import { useShared } from "@/hooks/use-shared";

export function Partner() {
  const { me, partner, savePartner, shared, features } = useShared();
  const [input, setInput] = useState(partner);

  useEffect(() => {
    setInput(partner);
  }, [partner]);

  if (!features.partner) return null;

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Partner Connection</h4>
      <div className="text-sm">
        <div className="mb-2">My User ID</div>
        <div className="flex items-center gap-2">
          <input className="bg-slate-900 text-white rounded px-2 py-1 w-full" value={me || "..."} readOnly />
          <button
            className="neon-focus bg-slate-800 text-white rounded px-3 py-1"
            onClick={() => navigator.clipboard.writeText(me || "")}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="text-sm">
        <div className="mb-2">Partner's User ID</div>
        <div className="flex items-center gap-2">
          <input
            className="bg-slate-900 text-white rounded px-2 py-1 w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste partner UID"
          />
          <button
            className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1"
            onClick={() => savePartner(input)}
          >
            Save Partner
          </button>
        </div>
      </div>

      <div className="text-sm">
        Status: {shared?.linked ? <span className="text-green-400">Linked</span> : <span className="text-yellow-400">Not linked</span>}
      </div>
    </section>
  );
}

