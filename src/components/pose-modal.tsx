import { useEffect } from "react";

type PoseModalProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
};

export function PoseModal({ open, onClose, imageSrc, title }: PoseModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="neon-card rounded-md p-4 max-w-md w-full text-center">
        <img alt={title} src={imageSrc} className="mx-auto" loading="lazy" decoding="async" />
        <div className="mt-3 text-white">{title}</div>
        <button className="mt-4 neon-focus bg-slate-800 text-white rounded px-4 py-1" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

