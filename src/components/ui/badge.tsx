import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning" | "neutral";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]",
    success: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
    danger: "border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold",
    warning: "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium",
    neutral: "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider rounded-[3px] select-none transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
