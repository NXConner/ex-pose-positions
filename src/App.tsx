import { useState, useMemo, useEffect } from "react";
import { 
  Header, 
  SexPositionCard, 
  EnhancedPartnerConnection, 
  EnhancedTonightPlans, 
  MyLists, 
  EnhancedGame, 
  Stats, 
  PhotoIdeas, 
  OfflineBadge, 
  UpdateToast, 
  Settings, 
  CameraSync, 
  PrivateGallery, 
  PinLock, 
  PositionsGallery,
  TopNavBar,
  Filters,
  SignIn
} from "@/components";
import { useActions } from "@/hooks";

export function App() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { filteredData, setPositionId } = useActions();
  
  // Apply search filter globally - when user searches, filter positions
  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return filteredData;
    const term = searchTerm.toLowerCase();
    const filtered = filteredData.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.id.toString().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
    return filtered;
  }, [filteredData, searchTerm]);
  
  // Auto-scroll to first match when search term changes (debounced)
  useEffect(() => {
    if (!searchTerm.trim() || searchFilteredData.length === 0) return;
    // Optionally scroll to first match or highlight it
    const firstMatch = searchFilteredData[0];
    if (firstMatch) {
      const index = filteredData.findIndex(p => p.id === firstMatch.id);
      if (index !== -1) {
        setPositionId(index);
      }
    }
  }, [searchTerm]); // Only on search term change, not on filteredData

  return (
    <div
      style={{ width: "92%", zIndex: 1 }}
      className="flex items-center justify-center w-full flex-col gap-5 p-5 relative mx-auto max-w-3xl"
    >
      <img
        alt=""
        loading="lazy"
        src={localStorage.getItem('bg_src') || 'images/background.png'}
        className="fixed top-0 left-0 w-full h-full object-cover"
        style={{ 
          opacity: Number(localStorage.getItem('bg_opacity') || 0.5), 
          filter: `blur(${localStorage.getItem('bg_blur') || 6}px)`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* HEADER */}
      <Header />

      {/* TOP NAVIGATION BAR */}
      <TopNavBar
        onFiltersToggle={() => setShowFilters(!showFilters)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* FILTERS (Conditional) */}
      {showFilters && <Filters />}

      {/* POSITION CARD (Now at top after header and nav) */}
      <SexPositionCard />

      {/* SIGN IN (if not signed in) */}
      <SignIn />

      {/* TONIGHT'S PLANS (Enhanced) */}
      <EnhancedTonightPlans />

      {/* CAMERA SYNC directly below image */}
      <CameraSync />

      {/* PARTNER CONNECTION (Enhanced) */}
      <EnhancedPartnerConnection />

      {/* MY LISTS */}
      <MyLists />

      {/* GAME (Enhanced with timer) */}
      <EnhancedGame />

      {/* STATS */}
      <Stats />

      {/* PHOTO IDEAS */}
      <PhotoIdeas />

      {/* GALLERY */}
      <PositionsGallery />

      {/* SETTINGS (Conditional, merged with Profile) */}
      {showSettings && <Settings />}

      {/* PRIVATE GALLERY */}
      <PrivateGallery />

      {/* Footer */}
      <div className="w-full text-center text-sm text-slate-400 mt-5">
        <p>Made with ❤️</p>
      </div>

      {/* Offline */}
      <OfflineBadge />
      <UpdateToast />
      <PinLock />
    </div>
  );
}
