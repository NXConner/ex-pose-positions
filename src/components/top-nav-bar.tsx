import { useState, useCallback } from "react";
import { useActions } from "@/hooks";
import { ManageLists } from "./manage-lists";
import { PrivateGallery } from "./private-gallery";

interface TopNavBarProps {
  onFiltersToggle: () => void;
  onSettingsToggle: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function TopNavBar({ onFiltersToggle, onSettingsToggle, searchTerm, onSearchChange }: TopNavBarProps) {
  const [openLists, setOpenLists] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);

  return (
    <>
      <nav className="w-full sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-pink-500/30 shadow-lg shadow-pink-500/20">
        <div className="flex items-center gap-2 p-3 flex-wrap">
          {/* Search Bar */}
          <input
            type="search"
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-[150px] bg-slate-800/80 text-white rounded-lg px-3 py-2 border border-pink-500/30 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 neon-focus"
            aria-label="Search positions by name, ID, or description"
            role="searchbox"
          />

          {/* Filters Button */}
          <button
            onClick={onFiltersToggle}
            className="neon-focus bg-pink-600 hover:bg-pink-700 duration-200 text-white rounded-lg px-3 py-2 flex items-center gap-1 shadow-md shadow-pink-500/30"
            title="Filters"
            aria-label="Toggle filters"
          >
            <span aria-hidden="true">⚙️</span>
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* My Lists Button */}
          <button
            onClick={() => setOpenLists(true)}
            className="neon-focus bg-purple-600 hover:bg-purple-700 duration-200 text-white rounded-lg px-3 py-2 flex items-center gap-1 shadow-md shadow-purple-500/30"
            title="My Lists"
            aria-label="Open my lists"
          >
            <span aria-hidden="true">📁</span>
            <span className="hidden sm:inline">Lists</span>
          </button>

          {/* Private Gallery Button */}
          <button
            onClick={() => setOpenGallery(true)}
            className="neon-focus bg-indigo-600 hover:bg-indigo-700 duration-200 text-white rounded-lg px-3 py-2 flex items-center gap-1 shadow-md shadow-indigo-500/30"
            title="Private Gallery"
            aria-label="Open private gallery"
          >
            <span aria-hidden="true">🖼️</span>
            <span className="hidden sm:inline">Gallery</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onSettingsToggle}
            className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-3 py-2 flex items-center gap-1 shadow-md"
            title="Settings"
            aria-label="Toggle settings"
          >
            <span aria-hidden="true">⚙️</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </nav>

      <ManageLists open={openLists} onClose={() => setOpenLists(false)} />
      {openGallery && <PrivateGallery onClose={() => setOpenGallery(false)} />}
    </>
  );
}

