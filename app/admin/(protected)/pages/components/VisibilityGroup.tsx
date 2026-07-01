"use client";

import { Eye } from "lucide-react";
import { GroupCard } from "./GroupCard";

export function VisibilityGroup({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <GroupCard icon={Eye} label="Visibility" tint="visibility">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Inactive pages redirect visitors to the homepage and are hidden from the Work overlay.
        </p>
        <button
          type="button"
          onClick={() => onToggle(!isActive)}
          className={[
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive ? "bg-foreground" : "bg-muted",
          ].join(" ")}
          aria-checked={isActive}
          role="switch"
          aria-label="Toggle page visibility"
        >
          <span
            className={[
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
              isActive ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>
    </GroupCard>
  );
}
