import { Footer, Header, Filters, SexPositionCard, Partner, Tonight, TonightPlans, MyLists, Game, Stats, PhotoIdeas, OfflineBadge, UpdateToast, Settings, Profile, CameraSync, PrivateGallery, PinLock, PositionsGallery } from "@/components";

export function App() {
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

      {/* TONIGHT'S PLANS (Top) */}
      <TonightPlans />

      {/* FILTER (above position image) */}
      <Filters />

      {/* POSITION CARD */}
      <SexPositionCard />

      {/* CAMERA SYNC directly below image */}
      <CameraSync />

      {/* TONIGHT */}
      <Tonight />

      {/* PARTNER */}
      <Partner />

      {/* MY LISTS */}
      <MyLists />

      {/* GAME */}
      <Game />

      {/* STATS */}
      <Stats />

      {/* PHOTO IDEAS */}
      <PhotoIdeas />

      {/* GALLERY */}
      <PositionsGallery />

      {/* SETTINGS */}
      <Settings />

      {/* PROFILE */}
      <Profile />

      {/* PRIVATE GALLERY */}
      <PrivateGallery />

      {/* CAMERA SYNC (beta) - removed duplicate bottom instance */}

      {/* Footer */}
      <Footer />

      {/* Offline */}
      <OfflineBadge />
      <UpdateToast />
      <PinLock />
    </div>
  );
}
