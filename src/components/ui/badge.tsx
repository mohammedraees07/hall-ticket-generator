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
    // Pure monochrome architectural tags with clean borders.
    // ZERO neon colors, zero transparent colored pills.
    default: "border border-[#2e323b] bg-[#16181e] text-[#f3f4f6]",
    success: "border border-[#383d48] bg-[#1b1d24] text-white font-semibold",
    danger: "border border-[#424652] bg-[#20222a] text-[#e5e7eb] font-semibold",
    warning: "border border-[#323540] bg-[#181a20] text-[#d1d5db]",
    neutral: "border border-[#252830] bg-[#111215] text-[#9ca3af]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider rounded-[3px] select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
