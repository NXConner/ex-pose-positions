import { useMemo, useState } from "react";
import { useActions } from "@/hooks";

export function PositionsGallery() {
  const { filteredData, setPositionId } = useActions();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? filteredData.filter((p)=> p.title.toLowerCase().includes(q)) : filteredData;
  }, [filteredData, query]);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg neon-accent">All Positions</h4>
        <input className="bg-slate-900 text-white rounded px-2 py-1" placeholder="Search..." value={query} onChange={(e)=>setQuery(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-[60vh] overflow-auto">
        {items.map((it, idx)=> (
          <button key={it.id} className="bg-slate-900/50 rounded hover:opacity-90" onClick={()=>setPositionId(idx)} title={`#${it.id} ${it.title}`}>
            <img src={`images/positions/${it.fileName}`} alt={it.title} loading="lazy" decoding="async" className="w-full h-24 object-cover rounded" />
          </button>
        ))}
      </div>
    </section>
  );
}

