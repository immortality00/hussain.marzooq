"use client";

import { useLayoutEffect, useRef } from "react";
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

const PILL = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium";

function ModeLabel({ label, Icon }: { label: string; Icon: typeof Box }) {
  return (
    <>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
    </>
  );
}

/**
 * The white indicator slides to the chosen view: a white copy of the row sits on
 * top and is clipped to the active button, and the clip moves (`.hm-mode-layer`).
 * Until it is measured (server HTML, first paint) the active button carries the
 * white itself. It slides only after a click, so a remembered choice never slides
 * in on load.
 */
export default function ModeSwitcher({
  mode,
  onChange,
  className = "",
}: {
  mode: ViewerMode;
  onChange: (mode: ViewerMode) => void;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const layer = layerRef.current;
    if (!row || !layer) return;
    const place = () => {
      const active = row.querySelector<HTMLElement>(`[data-mode="${mode}"]`);
      if (!active) return;
      const right = row.clientWidth - active.offsetLeft - active.offsetWidth;
      const bottom = row.clientHeight - active.offsetTop - active.offsetHeight;
      layer.style.clipPath = `inset(${active.offsetTop}px ${right}px ${bottom}px ${active.offsetLeft}px round 9999px)`;
      row.dataset.measured = "";
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(row);
    return () => resize.disconnect();
  }, [mode]);

  return (
    <div
      ref={rowRef}
      className={`group/modes relative inline-flex items-center gap-1 rounded-full border bg-background/60 p-1 ${className}`}
    >
      {MODES.map(({ mode: m, label, Icon }) => {
        const isActive = m === mode;
        return (
          <button
            key={m}
            type="button"
            data-mode={m}
            onClick={() => {
              if (rowRef.current) rowRef.current.dataset.slide = "";
              onChange(m);
            }}
            aria-pressed={isActive}
            title={label}
            className={`${PILL} transition-colors ${
              isActive
                ? "bg-foreground text-background group-data-measured/modes:bg-transparent group-data-measured/modes:text-muted-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <ModeLabel label={label} Icon={Icon} />
          </button>
        );
      })}
      <div
        ref={layerRef}
        aria-hidden
        className="hm-mode-layer pointer-events-none absolute inset-0 flex items-center gap-1 rounded-full bg-foreground p-1 text-background"
      >
        {MODES.map(({ mode: m, label, Icon }) => (
          <span key={m} className={PILL}>
            <ModeLabel label={label} Icon={Icon} />
          </span>
        ))}
      </div>
    </div>
  );
}
