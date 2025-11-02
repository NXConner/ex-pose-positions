import { useState, useEffect } from "react";
import { hapticError, hapticPress } from "@/utils/haptic";

interface ErrorToastProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function ErrorToast({
  message,
  onRetry,
  onDismiss,
  autoHide = true,
  duration = 5000,
}: ErrorToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  useEffect(() => {
    hapticError();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-fade-in">
      <div className="neon-card bg-red-900/90 border-red-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <div className="font-semibold text-red-200 mb-1">Error</div>
            <div className="text-sm text-red-100">{message}</div>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={() => {
                  hapticPress();
                  onRetry();
                  setVisible(false);
                }}
                className="neon-focus bg-red-700 hover:bg-red-600 text-white rounded px-3 py-1 text-sm"
                aria-label="Retry"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => {
                hapticPress();
                setVisible(false);
                onDismiss?.();
              }}
              className="neon-focus bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1 text-sm"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

