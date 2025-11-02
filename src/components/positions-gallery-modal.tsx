import { useMemo, useState, useCallback, useEffect } from "react";
import { useActions } from "@/hooks";
import { SEX_LEVELS } from "@/constants";

interface PositionsGalleryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedIds: number[]) => void;
  initialSelected?: number[];
}

const BADGE_COLORS: Record<string, string> = {
  [SEX_LEVELS.SAFE]: "bg-green-500",
  [SEX_LEVELS.BE_CAREFUL]: "bg-red-500",
  [SEX_LEVELS.DANGEROUS]: "bg-orange-500",
};

export function PositionsGalleryModal({ open, onClose, onSelect, initialSelected = [] }: PositionsGalleryModalProps) {
  const { filteredData } = useActions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected);

  useEffect(() => {
    setSelectedIds(initialSelected);
  }, [initialSelected, open]);

  const galleryItems = useMemo(() => {
    return filteredData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    );
  }, [filteredData, searchTerm]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(i => i !== id) : [...current, id]
    );
  }, []);

  const handleSave = useCallback(() => {
    onSelect(selectedIds);
    onClose();
  }, [onSelect, selectedIds, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="neon-card rounded-md p-4 w-full max-w-2xl max-h-[90vh] flex flex-col gap-3">
        <h4 className="text-lg neon-accent">Select Positions</h4>
        <input
          type="text"
          placeholder="Search positions by name or ID..."
          className="bg-slate-900 text-white rounded px-3 py-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex-grow overflow-y-auto p-2 border border-slate-700 rounded">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryItems.map((item) => {
              const customImage = localStorage.getItem(`custom_image_${item.id}`);
              const imageSrc = customImage || `images/positions/${item.fileName}`;
              return (
                <div
                  key={item.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden group ${
                    selectedIds.includes(item.id) ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => toggleSelect(item.id)}
                  title={item.title}
                >
                  <img
                    src={imageSrc}
                    alt={item.imageAlt}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs text-center p-1">
                    #{item.id} {item.title}
                  </div>
                  {selectedIds.includes(item.id) && (
                    <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-1 rounded-full">✔</div>
                  )}
                  <span className={`absolute top-1 right-1 text-white text-xs px-1 py-0.5 rounded ${
                    BADGE_COLORS[item.level] || 'bg-slate-500'
                  }`}>
                    {item.level.toUpperCase()}
                  </span>
                </div>
              );
            })}
            {galleryItems.length === 0 && (
              <div className="col-span-full text-center text-slate-400">No positions found.</div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button className="neon-focus bg-slate-700 hover:bg-slate-800 duration-200 text-white rounded px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded px-3 py-1" onClick={handleSave}>Add Selected ({selectedIds.length})</button>
        </div>
      </div>
    </div>
  );
}

