"use client";

import { AlertTriangle } from "lucide-react";

// Inline amber note shown when a visible surface has no card image and will
// therefore render as a blank panel on the public site.
export function CardImageWarning({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
