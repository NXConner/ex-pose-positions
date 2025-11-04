import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, description, error, startAdornment, endAdornment, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `pps-input-${generatedId}`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("pps-stack", className)}>
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--pps-color-text)" }}>
            {label}
          </label>
        ) : null}
        <div
          className="pps-inline"
          style={{
            alignItems: "stretch",
            background: "var(--pps-color-surface)",
            borderRadius: "var(--pps-radius-md)",
            border: error
              ? `1px solid var(--pps-color-danger)`
              : "1px solid color-mix(in srgb, var(--pps-color-outline) 80%, transparent 20%)",
          }}
        >
          {startAdornment ? (
            <span className="px-3 flex items-center" aria-hidden="true">
              {startAdornment}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className="pps-input"
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
            aria-invalid={Boolean(error) || undefined}
            {...rest}
          />
          {endAdornment ? (
            <span className="px-3 flex items-center" aria-hidden="true">
              {endAdornment}
            </span>
          ) : null}
        </div>
        {description ? (
          <span id={descriptionId} className="text-xs" style={{ color: "var(--pps-color-text-muted)" }}>
            {description}
          </span>
        ) : null}
        {error ? (
          <span id={errorId} className="text-xs" style={{ color: "var(--pps-color-danger)" }}>
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

