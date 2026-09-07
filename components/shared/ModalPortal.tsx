"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function ModalPortal({
  onClose,
  label,
  className,
  closeOnEscape = true,
  children,
}: {
  onClose: () => void;
  label: string;
  className?: string;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}) {
  useScrollLock();
  const containerRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    if (!closeOnEscape) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, closeOnEscape]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={className}
      onClick={onClose}
    >
      {children}
    </div>,
    document.body,
  );
}
