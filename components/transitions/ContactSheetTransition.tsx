"use client";

import type { ContactSheetCell } from "./contactSheet";

export type TransitionPhase = "in" | "out";

export interface ContactSheetState {
  cells: ContactSheetCell[];
}

export function ContactSheetTransition({
  state,
  phase,
  reduced,
}: {
  state: ContactSheetState | null;
  phase: TransitionPhase;
  reduced: boolean;
}) {
  if (reduced) {
    return <div className="hm-transition-overlay hm-transition-reduced" aria-hidden />;
  }

  if (!state) return null;

  return (
    <div className="hm-transition-overlay" aria-hidden>
      <div className="hm-transition-grid">
        {state.cells.map((cell) => (
          <div
            key={cell.index}
            className={phase === "in" ? "hm-cell hm-cell-in" : "hm-cell hm-cell-out"}
            style={{
              backgroundImage: cell.image ? `url(${cell.image})` : undefined,
              animationDelay: `${phase === "in" ? cell.inDelayMs : cell.outDelayMs}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
