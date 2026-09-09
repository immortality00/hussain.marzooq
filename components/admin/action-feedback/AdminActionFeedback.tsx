"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminStickyPortal } from "@/components/admin/AdminStickyStack";

export type AdminActionFeedbackType = "ok" | "err" | "info";

export type AdminActionFeedbackState = {
  type: AdminActionFeedbackType;
  text: string;
} | null;

const feedbackClasses: Record<AdminActionFeedbackType, string> = {
  ok: "border-green-500/30 bg-green-500/10 text-foreground",
  err: "border-red-500/30 bg-red-500/10 text-foreground",
  info: "border-sky-500/30 bg-sky-500/10 text-foreground",
};

const dismissAfterMs: Record<AdminActionFeedbackType, number> = {
  ok: 4000,
  err: 7000,
  info: 10000,
};

export function AdminProcessingPill({ text = "Processing" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
      {text}
    </span>
  );
}

export function AdminActionFeedback({
  feedback,
  className = "",
}: {
  feedback: AdminActionFeedbackState;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState<AdminActionFeedbackState>(null);

  const type = feedback?.type;

  useEffect(() => {
    if (!feedback || !type) return;
    const timer = setTimeout(() => setDismissed(feedback), dismissAfterMs[type]);
    return () => clearTimeout(timer);
  }, [feedback, type]);

  if (!feedback || dismissed === feedback) return null;

  return (
    <AdminStickyPortal>
      <div className={`rounded-2xl bg-card shadow-lg ${className}`}>
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm backdrop-blur ${feedbackClasses[feedback.type]}`}
          role={feedback.type === "err" ? "alert" : "status"}
          aria-live="polite"
        >
          {feedback.type === "info" ? (
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-500" />
          ) : null}
          <span className="min-w-0 flex-1">{feedback.text}</span>
          <button
            type="button"
            onClick={() => setDismissed(feedback)}
            aria-label="Dismiss message"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </AdminStickyPortal>
  );
}
