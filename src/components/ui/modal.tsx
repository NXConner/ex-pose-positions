import { createPortal } from "react-dom";
import { ReactNode, useEffect, useMemo } from "react";

import { cn } from "@/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  dismissLabel?: string;
}

function useModalContainer() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const existing = document.getElementById("pps-modal-root");
    if (existing) return existing;
    const el = document.createElement("div");
    el.setAttribute("id", "pps-modal-root");
    document.body.appendChild(el);
    return el;
  }, []);
}

export function Modal({ isOpen, onClose, title, children, dismissLabel = "Close" }: ModalProps) {
  const container = useModalContainer();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !container) {
    return null;
  }

  const headingWeight =
    typeof window !== "undefined"
      ? parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--pps-type-h4-weight")
            .trim() || "600",
          10
        )
      : 600;

  const modal = (
    <div className="pps-modal-backdrop" role="presentation">
      <div className="pps-modal" role="dialog" aria-modal="true" aria-labelledby={title ? "pps-modal-title" : undefined}>
        <div className="pps-inline" style={{ justifyContent: "space-between", marginBottom: "var(--pps-space-md)" }}>
          {title ? (
            <h2
              id="pps-modal-title"
              style={{
                fontSize: "var(--pps-type-h4-size)",
                lineHeight: "var(--pps-type-h4-line)",
                fontWeight: headingWeight,
              }}
            >
              {title}
            </h2>
          ) : null}
          <button
            type="button"
            className={cn("pps-btn", "pps-btn--ghost", "pps-btn--sm")}
            onClick={onClose}
            aria-label={dismissLabel}
          >
            ✕
          </button>
        </div>
        <div className="pps-stack" style={{ gap: "var(--pps-space-md)" }}>{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, container);
}

