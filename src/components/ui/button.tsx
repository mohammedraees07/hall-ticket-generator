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
        "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 font-semibold shadow-sm",
      secondary:
        "bg-[#1c1f26] text-white hover:bg-[#252831] border border-[#2e323b] active:bg-[#181a20]",
      outline:
        "bg-transparent text-[#e2e4e9] hover:bg-[#181a20] hover:text-white border border-[#2a2d36]",
      ghost:
        "bg-transparent text-[#9ca3af] hover:text-white hover:bg-[#181a20]",
      danger:
        "bg-[#261414] text-[#ef4444] hover:bg-[#381a1a] border border-[#ef4444]/30 font-medium",
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
          "inline-flex items-center justify-center gap-2 rounded-[5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer",
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
