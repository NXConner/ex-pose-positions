import { CSSProperties, forwardRef, HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
  elevation?: "level0" | "level1" | "level2" | "level3";
}

const elevationToShadow: Record<NonNullable<CardProps["elevation"]>, string> = {
  level0: "none",
  level1: "var(--pps-elevation, 0 4px 18px rgba(15, 23, 42, 0.08))",
  level2: "0 16px 32px rgba(15, 23, 42, 0.12)",
  level3: "0 24px 48px rgba(15, 23, 42, 0.16)",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, muted, elevation = "level1", style, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn("pps-card", muted && "pps-card--muted", className)}
      style={{
        ...style,
        ["--pps-elevation" as string]: elevationToShadow[elevation],
      } as CSSProperties}
      {...rest}
    />
  )
);

Card.displayName = "Card";

export const CardHeader = ({ className, style, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("pps-inline", className)}
    style={{ justifyContent: "space-between", alignItems: "flex-start", width: "100%", ...style }}
    {...rest}
  />
);

export const CardContent = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("pps-stack", className)} {...rest} />
);

export const CardFooter = ({ className, style, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("pps-inline", className)} style={{ justifyContent: "flex-end", width: "100%", ...style }} {...rest} />
);

