"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "xl",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-backdrop"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }}
    >
      <div
        className={cn(
          "modal-dialog w-full rounded-[5px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors",
          maxWidths[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--card)] text-[var(--foreground)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-[4px] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 bg-[var(--card)] text-[var(--foreground)]">{children}</div>
      </div>
    </div>
  );
}
