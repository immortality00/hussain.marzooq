"use client";

import { Box, LayoutGrid, MoveHorizontal } from "lucide-react";

export type ViewerMode = "cylinder" | "horizontal" | "grid";

export const VIEWER_MODE_STORAGE_KEY = "hm.photography.view";

export function isViewerMode(value: string): value is ViewerMode {
  return value === "cylinder" || value === "horizontal" || value === "grid";
}

const MODES: { mode: ViewerMode; label: string; Icon: typeof Box }[] = [
  { mode: "cylinder", label: "Cylinder", Icon: Box },
  { mode: "horizontal", label: "Scroll", Icon: MoveHorizontal },
  { mode: "grid", label: "Grid", Icon: LayoutGrid },
];

export default function ModeSwitcher({
  mode,
  onChange,
  className = "",
}: {
  mode: ViewerMode;
  onChange: (mode: ViewerMode) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border bg-background/60 p-1 ${className}`}
    >
      {MODES.map(({ mode: m, label, Icon }) => {
        const isActive = m === mode;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-pressed={isActive}
            title={label}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
