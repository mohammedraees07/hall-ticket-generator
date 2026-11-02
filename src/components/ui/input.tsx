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
          <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition-colors focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500">{error}</p>}
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
          <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-9 w-full rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
