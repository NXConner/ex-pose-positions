import { useState, useRef, useEffect, useMemo } from "react";
import { ManageLists } from "./manage-lists";
import { PrivateGallery } from "./private-gallery";

interface TopNavBarProps {
  onFiltersToggle: () => void;
  onSettingsToggle: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults?: { total: number; matches: number };
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

function getSearchHistory(): string[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(term: string): void {
  if (!term.trim()) return;
  try {
    const history = getSearchHistory();
    const filtered = history.filter(h => h.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}

export function TopNavBar({ onFiltersToggle, onSettingsToggle, searchTerm, onSearchChange, searchResults }: TopNavBarProps) {
  const [openLists, setOpenLists] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchHistory = useMemo(() => getSearchHistory(), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (term: string) => {
    if (term.trim()) {
      saveSearchHistory(term);
      onSearchChange(term);
      setShowSuggestions(false);
      searchRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(searchTerm);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchRef.current?.blur();
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return searchHistory;
    const term = searchTerm.toLowerCase();
    return searchHistory.filter(h => h.toLowerCase().includes(term));
  }, [searchTerm, searchHistory]);

  return (
    <>
      <nav className="w-full sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-pink-500/30 shadow-lg shadow-pink-500/20">
        <div className="flex items-center gap-2 p-3 flex-wrap">
          {/* Search Bar with Suggestions */}
          <div className="flex-1 min-w-[150px] relative" ref={searchRef}>
            <div className="relative">
              <input
                type="search"
                placeholder="Search positions... (Ctrl+K or /)"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  setFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setFocused(false), 200);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-800/80 text-white rounded-lg px-3 py-2 pr-10 border border-pink-500/30 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 neon-focus"
                aria-label="Search positions by name, ID, or description"
                role="searchbox"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setShowSuggestions(false);
                    searchRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                  type="button"
                >
                  ×
                </button>
              )}
              {searchResults && searchTerm && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {searchResults.matches}/{searchResults.total}
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (filteredHistory.length > 0 || searchTerm) && (
              <div
                ref={suggestionsRef}
                className="absolute top-full mt-1 w-full bg-slate-800/95 backdrop-blur-md border border-pink-500/30 rounded-lg shadow-lg z-50 max-h-64 overflow-auto"
                role="listbox"
              >
                {searchTerm && (
                  <button
                    onClick={() => handleSearchSubmit(searchTerm)}
                    className="w-full text-left px-4 py-2 hover:bg-pink-500/20 text-white flex items-center gap-2"
                    role="option"
                  >
                    <span>🔍</span>
                    <span>Search for &quot;{searchTerm}&quot;</span>
                  </button>
                )}
                {filteredHistory.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
                      Recent Searches
                    </div>
                    {filteredHistory.map((historyItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchSubmit(historyItem)}
                        className="w-full text-left px-4 py-2 hover:bg-pink-500/20 text-white flex items-center justify-between"
                        role="option"
                      >
                        <span className="flex items-center gap-2">
                          <span>🕒</span>
                          <span>{historyItem}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newHistory = searchHistory.filter(h => h !== historyItem);
                            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
                          }}
                          className="text-slate-400 hover:text-red-400"
                          aria-label={`Remove ${historyItem} from history`}
                        >
                          ×
                        </button>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

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
            title="Settings (Ctrl+,)"
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

