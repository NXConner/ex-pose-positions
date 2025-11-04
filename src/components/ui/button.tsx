import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "pps-btn--primary",
  secondary: "pps-btn--secondary",
  accent: "pps-btn--accent",
  outline: "pps-btn--outline",
  ghost: "pps-btn--ghost",
  danger: "pps-btn--danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "pps-btn--sm",
  md: "",
  lg: "pps-btn--lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", leadingIcon, trailingIcon, children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn("pps-btn", variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  )
);

Button.displayName = "Button";

