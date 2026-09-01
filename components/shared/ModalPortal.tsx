"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";

export function ModalPortal({
  onClose,
  className,
  closeOnEscape = true,
  children,
}: {
  onClose: () => void;
  className?: string;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}) {
  useScrollLock();

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
    <div className={className} onClick={onClose}>
      {children}
    </div>,
    document.body,
  );
}
