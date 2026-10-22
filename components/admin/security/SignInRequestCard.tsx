import { ShieldAlert } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import type { PendingSignIn } from "@/lib/server/sign-in-requests";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function SignInRequestCard({
  request,
  busy,
  onApprove,
  onReject,
}: {
  request: PendingSignIn;
  busy: boolean;
  onApprove: (choice: number) => void;
  onReject: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold wrap-anywhere">{request.device}</p>
          <p className="font-mono text-xs text-muted-foreground">{formatTime(request.createdAt)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {request.choices.map((choice) => (
          <AdminButton
            key={choice}
            className="justify-center py-4 font-mono text-2xl tabular-nums"
            aria-label={`Approve with ${choice}`}
            onClick={() => onApprove(choice)}
            disabled={busy}
          >
            {choice}
          </AdminButton>
        ))}
      </div>
      <AdminButton variant="danger" className="w-full justify-center" onClick={onReject} disabled={busy}>
        Reject
      </AdminButton>
    </section>
  );
}
