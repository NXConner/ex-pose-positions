import { CSSProperties } from "react";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  lines?: number;
  variant?: 'default' | 'pulse' | 'wave' | 'shimmer';
}

export function SkeletonLoader({ 
  width = "100%", 
  height, 
  className = "", 
  rounded = false,
  lines = 1,
  variant = 'pulse'
}: SkeletonLoaderProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const variantClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]',
    shimmer: 'animate-shimmer bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 bg-[length:200%_100%]',
    default: 'animate-pulse'
  };

  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={i === lines - 1 ? { ...style, width: '75%' } : style}
            className={`bg-slate-700 ${variantClasses[variant]} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
            aria-busy="true"
            aria-hidden={i > 0}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`bg-slate-700 ${variantClasses[variant]} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      aria-busy="true"
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ImageSkeleton({ className = "", aspectRatio?: 'square' | 'landscape' | 'portrait' }: { className?: string; aspectRatio?: 'square' | 'landscape' | 'portrait' }) {
  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };
  
  return (
    <div 
      className={`w-full max-w-sm ${aspectClasses[aspectRatio || 'landscape']} bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden animate-pulse ${className}`}
      role="status"
      aria-label="Loading image..."
    >
      <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700" />
      <span className="sr-only">Loading image...</span>
    </div>
  );
}

export function CardSkeleton({ className = "", showImage = true }: { className?: string; showImage?: boolean }) {
  return (
    <div className={`neon-card rounded-md p-4 flex flex-col gap-3 ${className}`} role="status" aria-label="Loading card...">
      {showImage && <SkeletonLoader height={200} width="100%" className="rounded" />}
      <SkeletonLoader height={24} width="60%" className="rounded" />
      <SkeletonLoader height={16} width="90%" className="rounded" />
      <SkeletonLoader height={16} width="75%" className="rounded" />
      <span className="sr-only">Loading card content...</span>
    </div>
  );
}

export function ListSkeleton({ items = 5, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Loading list...">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <SkeletonLoader width={40} height={40} rounded className="flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonLoader height={16} width={i % 2 === 0 ? '80%' : '60%'} />
            <SkeletonLoader height={12} width="40%" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading list items...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`w-full ${className}`} role="status" aria-label="Loading table...">
      <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLoader key={i} height={20} width="100%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLoader key={j} height={16} width="100%" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table data...</span>
    </div>
  );
}

