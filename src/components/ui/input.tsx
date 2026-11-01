import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-[5px] border border-[#272a33] bg-[#0d0e12] px-3 py-1 text-xs text-white placeholder:text-[#525866] outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-9 w-full rounded-[5px] border border-[#272a33] bg-[#0d0e12] px-3 py-1 text-xs text-white outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
