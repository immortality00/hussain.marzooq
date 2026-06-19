"use client";

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
  className = "mt-4",
}: {
  feedback: AdminActionFeedbackState;
  className?: string;
}) {
  if (!feedback) return null;

  return (
    <div
      className={`${className} rounded-2xl border px-4 py-3 text-sm ${feedbackClasses[feedback.type]}`}
      role={feedback.type === "err" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {feedback.type === "info" ? (
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-500" />
        ) : null}
        <span>{feedback.text}</span>
      </div>
    </div>
  );
}