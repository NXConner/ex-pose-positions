import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { 
  Header, 
  SexPositionCard, 
  TopNavBar,
  Filters,
  OfflineBadge, 
  UpdateToast, 
  PinLock
} from "@/components";
import { useActions } from "@/hooks";
import { LazyWrapper } from "@/components/lazy-wrapper";

// Lazy load heavy components
const EnhancedPartnerConnection = lazy(() => import("@/components/enhanced-partner-connection").then(m => ({ default: m.EnhancedPartnerConnection })));
const EnhancedTonightPlans = lazy(() => import("@/components/enhanced-tonight-plans").then(m => ({ default: m.EnhancedTonightPlans })));
const EnhancedGame = lazy(() => import("@/components/enhanced-game").then(m => ({ default: m.EnhancedGame })));
const MyLists = lazy(() => import("@/components/my-lists").then(m => ({ default: m.MyLists })));
const Stats = lazy(() => import("@/components/stats").then(m => ({ default: m.Stats })));
const PhotoIdeas = lazy(() => import("@/components/photo-ideas").then(m => ({ default: m.PhotoIdeas })));
const PositionsGallery = lazy(() => import("@/components/positions-gallery").then(m => ({ default: m.PositionsGallery })));
const Settings = lazy(() => import("@/components/settings").then(m => ({ default: m.Settings })));
const CameraSync = lazy(() => import("@/components/camera-sync").then(m => ({ default: m.CameraSync })));
const PrivateGallery = lazy(() => import("@/components/private-gallery").then(m => ({ default: m.PrivateGallery })));
const SignIn = lazy(() => import("@/components/sign-in").then(m => ({ default: m.SignIn })));

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
      <LazyWrapper>
        <SignIn />
      </LazyWrapper>

      {/* TONIGHT'S PLANS (Enhanced) */}
      <LazyWrapper>
        <EnhancedTonightPlans />
      </LazyWrapper>

      {/* CAMERA SYNC directly below image */}
      <LazyWrapper>
        <CameraSync />
      </LazyWrapper>

      {/* PARTNER CONNECTION (Enhanced) */}
      <LazyWrapper>
        <EnhancedPartnerConnection />
      </LazyWrapper>

      {/* MY LISTS */}
      <LazyWrapper>
        <MyLists />
      </LazyWrapper>

      {/* GAME (Enhanced with timer) */}
      <LazyWrapper>
        <EnhancedGame />
      </LazyWrapper>

      {/* STATS */}
      <LazyWrapper>
        <Stats />
      </LazyWrapper>

      {/* PHOTO IDEAS */}
      <LazyWrapper>
        <PhotoIdeas />
      </LazyWrapper>

      {/* GALLERY */}
      <LazyWrapper>
        <PositionsGallery />
      </LazyWrapper>

      {/* SETTINGS (Conditional, merged with Profile) */}
      {showSettings && (
        <LazyWrapper>
          <Settings />
        </LazyWrapper>
      )}

      {/* PRIVATE GALLERY */}
      <LazyWrapper>
        <PrivateGallery />
      </LazyWrapper>

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
