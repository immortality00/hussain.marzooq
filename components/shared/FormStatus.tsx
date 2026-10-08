export type FormStatusState = { type: "ok" | "err"; text: string } | null;

export function FormStatus({ status, className = "" }: { status: FormStatusState; className?: string }) {
  if (!status) return null;
  return (
    <div
      role={status.type === "err" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm text-foreground ring-1 ${
        status.type === "ok" ? "bg-green-500/10 ring-green-500/20" : "bg-red-500/10 ring-red-500/20"
      } ${className}`}
    >
      {status.text}
    </div>
  );
}
