import { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type SpaceToken = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

function spaceVar(token: SpaceToken) {
  return `var(--pps-space-${token})`;
}

const alignMap: Record<"start" | "center" | "end" | "stretch", string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: SpaceToken;
  align?: "start" | "center" | "end" | "stretch";
}

export function Stack({ spacing = "md", align = "stretch", className, style, ...rest }: StackProps) {
  return (
    <div
      className={cn("pps-stack", className)}
      style={{ gap: spaceVar(spacing), alignItems: alignMap[align], ...style }}
      {...rest}
    />
  );
}

export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: SpaceToken;
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
}

export function Inline({ spacing = "md", align = "center", wrap = false, className, style, ...rest }: InlineProps) {
  return (
    <div
      className={cn("pps-inline", className)}
      style={{ gap: spaceVar(spacing), alignItems: alignMap[align], flexWrap: wrap ? "wrap" : "nowrap", ...style }}
      {...rest}
    />
  );
}

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: "level0" | "level1" | "level2" | "level3";
}

export function Surface({ elevation = "level0", className, style, ...rest }: SurfaceProps) {
  const shadowMap: Record<SurfaceProps["elevation"], string> = {
    level0: "none",
    level1: "0 4px 18px rgba(15, 23, 42, 0.08)",
    level2: "0 16px 32px rgba(15, 23, 42, 0.12)",
    level3: "0 24px 48px rgba(15, 23, 42, 0.16)",
  };
  return (
    <div
      className={cn("pps-surface", className)}
      style={{ boxShadow: shadowMap[elevation], ...style }}
      {...rest}
    />
  );
}

export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("pps-visually-hidden", className)} {...rest} />;
}

