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
import { CollapsibleSection } from "@/components/collapsible-section";
import { QuickJump } from "@/components/quick-jump";
import { useActions } from "@/hooks";
import { LazyWrapper } from "@/components/lazy-wrapper";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

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

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "f",
      ctrlKey: true,
      action: () => setShowFilters(!showFilters),
      description: "Toggle filters"
    },
    {
      key: ",",
      ctrlKey: true,
      action: () => setShowSettings(!showSettings),
      description: "Toggle settings"
    },
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: "Focus search"
    },
    {
      key: "/",
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: "Focus search"
    }
  ]);

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
                <CollapsibleSection title="Tonight's Plans" icon="💝" defaultOpen={true}>
                  <EnhancedTonightPlans />
                </CollapsibleSection>
              </LazyWrapper>

      {/* CAMERA SYNC directly below image */}
      <LazyWrapper>
        <CameraSync />
      </LazyWrapper>

              {/* QUICK JUMP NAVIGATION */}
              <QuickJump />

              {/* PARTNER CONNECTION (Enhanced) */}
              <LazyWrapper>
                <CollapsibleSection title="Partner Connection" icon="💝" defaultOpen={false}>
                  <EnhancedPartnerConnection />
                </CollapsibleSection>
              </LazyWrapper>

              {/* MY LISTS */}
              <LazyWrapper>
                <CollapsibleSection title="My Lists" icon="📁" defaultOpen={false}>
                  <MyLists />
                </CollapsibleSection>
              </LazyWrapper>

              {/* GAME (Enhanced with timer) */}
              <LazyWrapper>
                <CollapsibleSection title="Game" icon="🎮" defaultOpen={false}>
                  <EnhancedGame />
                </CollapsibleSection>
              </LazyWrapper>

              {/* STATS */}
              <LazyWrapper>
                <CollapsibleSection title="Stats" icon="📊" defaultOpen={false}>
                  <Stats />
                </CollapsibleSection>
              </LazyWrapper>

              {/* PHOTO IDEAS */}
              <LazyWrapper>
                <CollapsibleSection title="Photo Ideas" icon="📸" defaultOpen={false}>
                  <PhotoIdeas />
                </CollapsibleSection>
              </LazyWrapper>

              {/* GALLERY */}
              <LazyWrapper>
                <CollapsibleSection title="All Positions Gallery" icon="🖼️" defaultOpen={false}>
                  <PositionsGallery />
                </CollapsibleSection>
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
