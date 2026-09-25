import { Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import type { PushDevice } from "@/lib/push-subscription";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PushDeviceList({
  devices,
  busy,
  onRemove,
}: {
  devices: PushDevice[];
  busy: boolean;
  onRemove: (id: string) => void;
}) {
  if (devices.length === 0) return null;

  return (
    <div className="divide-y rounded-xl border">
      {devices.map((device) => (
        <div key={device.id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex-1 truncate">{device.label}</span>
          <span className="font-mono text-xs text-muted-foreground">{formatDate(device.createdAt)}</span>
          <AdminButton
            size="xs"
            variant="ghost"
            aria-label={`Remove ${device.label}`}
            onClick={() => onRemove(device.id)}
            disabled={busy}
          >
            <Trash2 className="size-3.5" />
          </AdminButton>
        </div>
      ))}
    </div>
  );
}
