"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { LOADING_LINES, LOADING_LINE_MS, loadingLine } from "@/lib/loading-lines";

const firstLine = Math.floor(Math.random() * LOADING_LINES.length);
const subscribeNever = () => () => {};

export function LoadingScreen({ className }: { className?: string }) {
  const start = useSyncExternalStore(subscribeNever, () => firstLine, () => null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => current + 1), LOADING_LINE_MS);
    return () => clearInterval(timer);
  }, []);

  const line = start === null ? null : loadingLine(start + step);

  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-5 px-6 text-center", className)}
    >
      <span aria-hidden className="hm-wordmark h-12 text-foreground" />
      <span aria-hidden className="hm-spinner text-foreground" />
      <span className="sr-only">Loading</span>
      <p aria-hidden key={line ?? "pending"} className="hm-loading-line min-h-5 text-sm text-muted-foreground">
        {line}
      </p>
    </div>
  );
}
