import { Suspense, ReactNode } from "react";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  const defaultFallback = (
    <div className="w-full neon-card rounded-md p-4 flex items-center justify-center min-h-[200px]">
      <div className="animate-pulse flex flex-col gap-3 w-full">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-32 bg-slate-700 rounded"></div>
      </div>
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

