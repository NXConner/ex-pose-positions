import { useEffect, useState } from "react";

type BgType = 'image' | 'video';

export function BackgroundUploader() {
  const [bgType, setBgType] = useState<BgType>(() => (localStorage.getItem('bg_type') as BgType) || 'image');
  const [src, setSrc] = useState<string>(() => localStorage.getItem('bg_src') || '');
  const [blur, setBlur] = useState<number>(() => Number(localStorage.getItem('bg_blur') || 6));
  const [opacity, setOpacity] = useState<number>(() => Number(localStorage.getItem('bg_opacity') || 0.5));

  useEffect(() => {
    localStorage.setItem('bg_type', bgType);
    localStorage.setItem('bg_src', src);
    localStorage.setItem('bg_blur', String(blur));
    localStorage.setItem('bg_opacity', String(opacity));
    document.documentElement.style.setProperty('--bg-blur', `${blur}px`);
    document.documentElement.style.setProperty('--bg-opacity', String(opacity));
  }, [bgType, src, blur, opacity]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
  }

  return (
    <div className="grid gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="min-w-24">Type</label>
        <select className="neon-focus bg-slate-800 text-white rounded px-2 py-1" value={bgType} onChange={(e)=>setBgType(e.target.value as BgType)}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="min-w-24">Upload</label>
        <input type="file" accept={bgType==='image' ? 'image/*' : 'video/*'} onChange={onFile} />
      </div>
      <div className="flex items-center gap-2">
        <label className="min-w-24">Blur</label>
        <input type="range" min={0} max={20} value={blur} onChange={(e)=>setBlur(Number(e.target.value))} />
        <span>{blur}px</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="min-w-24">Opacity</label>
        <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e)=>setOpacity(Number(e.target.value))} />
        <span>{opacity}</span>
      </div>
    </div>
  );
}

