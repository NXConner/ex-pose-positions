import { useCallback, useState, useEffect } from "react";
import { SEX_LEVELS } from "@/constants";

import { useActions } from "@/hooks";
import { getRandomNumber } from "@/utils";
import { ManageLists } from "./manage-lists";

const BADGE_COLORS: Record<string, string> = {
  [SEX_LEVELS.SAFE]: "bg-green-500",
  [SEX_LEVELS.BE_CAREFUL]: "bg-red-500",
  [SEX_LEVELS.DANGEROUS]: "bg-orange-500",
};

const DEFAULT_POSITION = {
  id: 0,
  title: "",
  level: "",
  fileName: "0-preview.png",
  imageAlt: "Random Sex Position",
  description: "",
  pros: [] as string[],
  cons: [] as string[],
};

export function SexPositionCard() {
  const { activePosition, positionId, filteredData, setPositionId } = useActions();
  const [openLists, setOpenLists] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const total = filteredData?.length || 0;

  const vibrate = (ms: number) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} };

  const handleImageClick = useCallback(() => {
    if (!filteredData || filteredData.length === 0) return;
    const next = getRandomNumber(0, filteredData.length - 1);
    setPositionId(next);
    vibrate(10);
  }, [filteredData]);

  const goPrev = useCallback(() => {
    if (!total) return;
    const prev = positionId > 0 ? positionId - 1 : total - 1;
    setPositionId(prev);
    vibrate(10);
  }, [positionId, total]);

  const goNextRandom = useCallback(() => {
    handleImageClick();
  }, [handleImageClick]);

  // Listen for global event to open Manage Lists (e.g., from drop target)
  useEffect(() => {
    function open() { setOpenLists(true); }
    document.addEventListener('open-manage-lists', open as EventListener);
    return () => document.removeEventListener('open-manage-lists', open as EventListener);
  }, []);

  const { id, level, title, imageAlt, fileName, description, pros, cons } =
    positionId === 0 || !activePosition ? DEFAULT_POSITION : activePosition;

  // Check for custom image
  const customImageSrc = id ? localStorage.getItem(`custom_image_${id}`) : null;
  const imageSrc = customImageSrc || `images/positions/${fileName}`;

  return (
    <div
      title={title}
      className="w-full relative glass-card overflow-hidden rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-slate-500 mb-4 animate__animated animate__fadeIn shadow-sm"
      onKeyDown={(e)=>{ if (e.key==='ArrowLeft') { e.preventDefault(); goPrev(); } if (e.key==='ArrowRight') { e.preventDefault(); goNextRandom(); } }}
    >
      {level && (
        <span
          className={`${"rounded-md shadow-sm leading-7 px-3 absolute top-5 right-5 text-white text-xs"} ${
            BADGE_COLORS[level] ?? "bg-slate-200"
          }`}
        >
          {level.toUpperCase()}
        </span>
      )}

      {/* Left/Right overlay controls */}
      {total > 0 && (
        <>
          <button
            aria-label="Previous"
            onClick={goPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-slate-900/70 text-white rounded-full w-12 h-12 max-sm:w-14 max-sm:h-14 flex items-center justify-center neon-focus"
            title="Previous"
          >
            <span className="text-lg">&#60;</span>
          </button>
          <button
            aria-label="Next random"
            onClick={goNextRandom}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900/70 text-white rounded-full w-12 h-12 max-sm:w-14 max-sm:h-14 flex items-center justify-center neon-focus"
            title="Next random"
          >
            <span className="text-lg">&#62;</span>
          </button>
        </>
      )}

      {imgLoading && (
        <div className="w-full max-w-sm h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      )}

      <img
        alt={imageAlt}
        src={imageSrc}
        srcSet={customImageSrc ? undefined : `${imageSrc} 1x`}
        loading="lazy"
        decoding="async"
        onLoad={() => setImgLoading(false)}
        onClick={handleImageClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleImageClick(); } }}
        draggable
        onDragStart={(e)=>{ e.dataTransfer.setData('text/pose-index', String(positionId)); e.dataTransfer.effectAllowed='copy'; }}
        role="button"
        tabIndex={0}
        className={`cursor-pointer ${localStorage.getItem('invert_positions')==='1' ? 'invert' : ''}`}
        title="Click to get a new position"
      />

      <h3 className="mt-4">
        {id ? `Position No: ${id}` : "More Than 500 Sex Positions"}
      </h3>
      <p>
        {title
          ? `Position Name: ${title}`
          : "Get Your Random Position And Try It Tonight!"}
      </p>

      {description && (
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-200 max-w-prose text-center">
          {description}
        </div>
      )}

      {(pros?.length || cons?.length) && (
        <div className="mt-3 grid gap-2 text-sm w-full max-w-md">
          {pros?.length ? (
            <div>
              <div className="font-semibold text-green-400">Pros</div>
              <ul className="list-disc pl-5 text-slate-600 dark:text-slate-200">
                {pros.map((p, i) => (
                  <li key={`pro-${i}`}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {cons?.length ? (
            <div>
              <div className="font-semibold text-red-400">Cons</div>
              <ul className="list-disc pl-5 text-slate-600 dark:text-slate-200">
                {cons.map((c, i) => (
                  <li key={`con-${i}`}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {id ? (
        <div className="mt-2">
          <button
            className="neon-focus bg-slate-800 text-white rounded px-3 py-1"
            onClick={() => setOpenLists(true)}
          >
            Add to / Manage Lists
          </button>
        </div>
      ) : null}

      <ManageLists open={openLists} onClose={() => setOpenLists(false)} />
    </div>
  );
}
