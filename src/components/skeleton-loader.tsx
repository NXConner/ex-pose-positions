import { CSSProperties } from "react";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  lines?: number;
}

export function SkeletonLoader({ 
  width = "100%", 
  height, 
  className = "", 
  rounded = false,
  lines = 1 
}: SkeletonLoaderProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={i === lines - 1 ? { ...style, width: '75%' } : style}
            className={`bg-slate-700 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
            aria-busy="true"
            aria-label="Loading..."
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`bg-slate-700 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full max-w-sm h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 animate-pulse" />
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`neon-card rounded-md p-4 flex flex-col gap-3 ${className}`}>
      <SkeletonLoader height={24} width="60%" className="rounded" />
      <SkeletonLoader height={16} width="90%" className="rounded" />
      <SkeletonLoader height={16} width="75%" className="rounded" />
      <SkeletonLoader height={200} width="100%" className="rounded" />
    </div>
  );
}

