import { KeyRound, Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import type { AdminPasskey } from "@/lib/server/passkeys";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PasskeyList({
  passkeys,
  busy,
  onRemove,
}: {
  passkeys: AdminPasskey[];
  busy: boolean;
  onRemove: (passkey: AdminPasskey) => void;
}) {
  if (passkeys.length === 0) {
    return <p className="text-amber-600 dark:text-amber-400">No passkey yet.</p>;
  }

  const last = passkeys.length === 1;
  return (
    <div className="divide-y rounded-xl border">
      {passkeys.map((passkey) => (
        <div key={passkey.id} className="flex items-center gap-3 px-4 py-2.5">
          <KeyRound className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 wrap-anywhere">
            {passkey.name}
            {passkey.synced ? <span className="text-muted-foreground"> · synced</span> : null}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {formatDate(passkey.lastUsedAt ?? passkey.createdAt)}
          </span>
          <AdminButton
            size="xs"
            variant="ghost"
            aria-label={`Remove ${passkey.name}`}
            onClick={() => onRemove(passkey)}
            disabled={busy || last}
          >
            <Trash2 className="size-3.5" />
          </AdminButton>
        </div>
      ))}
    </div>
  );
}
