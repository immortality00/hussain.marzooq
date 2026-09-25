"use client";

import { Bell, BellOff, Send } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { PushDeviceList } from "@/components/admin/push/PushDeviceList";
import { useAdminPush } from "@/hooks/useAdminPush";
import type { PushSupport } from "@/lib/client/push-support";
import type { PushDevice } from "@/lib/push-subscription";

const SUPPORT_STATUS: Record<Exclude<PushSupport, "supported">, string> = {
  checking: "Checking this browser…",
  "needs-install": "Home Screen app only.",
  unsupported: "Not supported in this browser.",
};

type AdminPush = ReturnType<typeof useAdminPush>;

function PushControls({ push }: { push: AdminPush }) {
  const Icon = push.subscribed ? Bell : BellOff;
  const status = push.subscribed
    ? "On for this device."
    : push.blocked
      ? "Blocked in this browser."
      : "Off for this device.";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`inline-flex flex-1 items-center gap-2 ${push.subscribed ? "" : "text-muted-foreground"}`}
      >
        <Icon className={`size-4 ${push.subscribed ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
        {status}
      </span>
      {push.subscribed ? (
        <>
          <AdminButton size="sm" onClick={push.sendTest} disabled={push.busy}>
            <Send className="size-3.5" />
            Send test
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={push.disable} disabled={push.busy}>
            Turn off
          </AdminButton>
        </>
      ) : (
        <AdminButton size="sm" variant="solid" onClick={push.enable} disabled={push.busy}>
          <Bell className="size-3.5" />
          Turn on
        </AdminButton>
      )}
    </div>
  );
}

export function PushNotificationsCard({
  publicKey,
  devices,
}: {
  publicKey: string | null;
  devices: PushDevice[];
}) {
  const push = useAdminPush(publicKey);

  return (
    <section className="overflow-hidden rounded-2xl border">
      <div className="border-b px-5 py-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Notifications
        </h2>
      </div>

      <div className="space-y-4 px-5 py-4 text-sm">
        {!publicKey ? (
          <p className="text-muted-foreground">Push notifications are not configured yet.</p>
        ) : push.support === "supported" ? (
          <PushControls push={push} />
        ) : (
          <p className="text-muted-foreground">{SUPPORT_STATUS[push.support]}</p>
        )}

        <PushDeviceList devices={devices} busy={push.busy} onRemove={push.removeDevice} />
      </div>

      <AdminActionFeedback feedback={push.feedback} />
    </section>
  );
}
