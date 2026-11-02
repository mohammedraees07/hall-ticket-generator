import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const variants = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] font-semibold shadow-sm border border-[var(--primary)]",
      secondary:
        "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)] active:scale-[0.99]",
      outline:
        "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)]",
      ghost:
        "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]",
      danger:
        "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/30 font-medium",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-5 text-sm",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
