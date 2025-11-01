import { useActions } from "@/hooks";

export function Gallery() {
  const { filteredData, setPositionId } = useActions();
  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">All Positions</h4>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[70vh] overflow-auto">
        {filteredData.map((it, idx) => (
          <button key={it.id} className="bg-slate-900/60 rounded overflow-hidden text-left" onClick={()=>setPositionId(idx)} title={`#${it.id} ${it.title}`}>
            <img src={`images/positions/${it.fileName}`} alt={it.title} loading="lazy" decoding="async" className="w-full h-28 object-cover" />
            <div className="text-[11px] text-slate-300 px-2 py-1 truncate">#{it.id} {it.title}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

