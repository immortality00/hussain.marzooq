import { SuccessCheck } from "@/components/shared/SuccessCheck";

export type FormStatusState = { type: "ok" | "err"; text: string } | null;

export function FormStatus({ status, className = "" }: { status: FormStatusState; className?: string }) {
  if (!status) return null;
  const ok = status.type === "ok";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`rounded-2xl px-4 py-3 text-sm text-foreground ring-1 ${
        ok ? "flex items-center gap-2.5 bg-green-500/10 ring-green-500/20" : "bg-red-500/10 ring-red-500/20"
      } ${className}`}
    >
      {ok ? <SuccessCheck /> : null}
      {ok ? <span className="min-w-0">{status.text}</span> : status.text}
    </div>
  );
}
