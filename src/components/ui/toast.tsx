import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface ToastOptions {
  title?: string;
  description?: string;
  tone?: ToastTone;
  timeoutMs?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  publish: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  toasts: ToastRecord[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const publish = useCallback((options: ToastOptions) => {
    const id = randomId();
    const tone = options.tone ?? "neutral";
    const timeout = options.timeoutMs ?? 6000;
    setToasts((prev) => [...prev, { id, ...options, tone }]);

    if (timeout > 0 && typeof window !== "undefined") {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, timeout);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ publish, dismiss, toasts }), [publish, dismiss, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="pps-toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn("pps-toast")} data-tone={toast.tone}>
          {toast.title ? <strong style={{ fontSize: "var(--pps-type-body-base-size)" }}>{toast.title}</strong> : null}
          {toast.description ? <span className="text-sm" style={{ color: "var(--pps-color-text-muted)" }}>{toast.description}</span> : null}
          <button
            type="button"
            className="pps-btn pps-btn--ghost pps-btn--sm"
            onClick={() => dismiss(toast.id)}
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}

