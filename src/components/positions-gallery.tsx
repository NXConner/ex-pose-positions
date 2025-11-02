import { useMemo, useState } from "react";
import { useActions } from "@/hooks";

export function PositionsGallery() {
  const { filteredData, setPositionId } = useActions();
  const [query, setQuery] = useState("");
  const [invertGallery, setInvertGallery] = useState(() => localStorage.getItem('invert_gallery') === 'true');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? filteredData.filter((p)=> p.title.toLowerCase().includes(q)) : filteredData;
  }, [filteredData, query]);

  const handleInvertToggle = (checked: boolean) => {
    setInvertGallery(checked);
    localStorage.setItem('invert_gallery', String(checked));
  };

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-lg neon-accent">All Positions</h4>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={invertGallery}
              onChange={(e) => handleInvertToggle(e.target.checked)}
              className="w-4 h-4"
            />
            Invert Colors
          </label>
          <input 
            className="bg-slate-900 text-white rounded px-2 py-1" 
            placeholder="Search..." 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)} 
          />
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-[60vh] overflow-auto">
        {items.map((it, idx)=> {
          const customImage = localStorage.getItem(`custom_image_${it.id}`);
          const imageSrc = customImage || `images/positions/${it.fileName}`;
          return (
            <button 
              key={it.id} 
              className="bg-slate-900/50 rounded hover:opacity-90" 
              onClick={()=>setPositionId(idx)} 
              title={`#${it.id} ${it.title}`}
            >
              <img 
                src={imageSrc} 
                alt={it.title} 
                loading="lazy" 
                decoding="async" 
                className={`w-full h-24 object-cover rounded ${invertGallery ? 'invert' : ''}`} 
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

