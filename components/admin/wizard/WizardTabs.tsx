"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function WizardTabs({
  steps,
  step,
  onStep,
}: {
  steps: readonly string[];
  step: number;
  onStep: (index: number) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabRefs.current[step]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [step]);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1.5">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onClick={() => onStep(index)}
            aria-current={index === step ? "step" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
              index === step
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <span className="font-mono tabular-nums">{index + 1}</span> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
