import { useState } from "react";
import { fileToDataUrl, loadVault, saveVault, VaultItem } from "@/services/vault";

interface PrivateGalleryProps {
  onClose?: () => void;
}

export function PrivateGallery({ onClose }: PrivateGalleryProps) {
  const [items, setItems] = useState<VaultItem[]>(() => loadVault());

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const mapped: VaultItem[] = [];
    for (const f of files) {
      const dataUrl = await fileToDataUrl(f);
      const type = f.type.startsWith('video') ? 'video' : 'image';
      mapped.push({ id: `${Date.now()}-${f.name}`, name: f.name, type, dataUrl, createdAt: Date.now() });
    }
    const next = [...mapped, ...items];
    setItems(next); saveVault(next);
    e.currentTarget.value = '';
  }

  function remove(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next); saveVault(next);
  }

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg neon-accent">Private Gallery</h4>
        {onClose && (
          <button
            onClick={onClose}
            className="neon-focus bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1"
            aria-label="Close gallery"
          >
            ✕ Close
          </button>
        )}
      </div>
      <input type="file" multiple accept="image/*,video/*" onChange={onUpload} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.id} className="relative bg-black/40 rounded overflow-hidden">
            {it.type === 'image' ? (
              <img src={it.dataUrl} alt={it.name} className="w-full h-40 object-cover" />
            ) : (
              <video src={it.dataUrl} controls className="w-full h-40 object-cover" />
            )}
            <button className="absolute top-2 right-2 bg-red-700 text-white text-xs rounded px-2 py-0.5" onClick={()=>remove(it.id)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}

