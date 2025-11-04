import { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "",
  info: "pps-badge--info",
  success: "pps-badge--success",
  warning: "pps-badge--warning",
  danger: "pps-badge--danger",
};

export function Badge({ className, tone = "neutral", startIcon, endIcon, children, ...rest }: BadgeProps) {
  return (
    <span className={cn("pps-badge", toneClasses[tone], className)} {...rest}>
      {startIcon ? <span aria-hidden="true">{startIcon}</span> : null}
      <span>{children}</span>
      {endIcon ? <span aria-hidden="true">{endIcon}</span> : null}
    </span>
  );
}

