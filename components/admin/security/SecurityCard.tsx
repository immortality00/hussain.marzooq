"use client";

import { useState } from "react";
import { KeyRound, LogOut, ShieldAlert } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { ChoiceDialog } from "@/components/admin/choice-dialog/ChoiceDialog";
import { useChoice } from "@/components/admin/choice-dialog/useChoice";
import { useAdminData } from "@/hooks/useAdminData";
import { ADMIN_APPROVE_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";
import type { AdminPasskey } from "@/lib/server/passkeys";
import { AddPasskeyDialog } from "./AddPasskeyDialog";
import { PasskeyList } from "./PasskeyList";
import { useAdminSecurity } from "./useAdminSecurity";

type Question = { heading: string; confirm: string };
type Answer = "confirm" | "cancel";

export function SecurityCard() {
  const security = useAdminData()?.security;
  const actions = useAdminSecurity();
  const [adding, setAdding] = useState(false);
  const { pending, ask } = useChoice<Question, Answer>();

  if (!security) return null;

  async function remove(passkey: AdminPasskey) {
    if ((await ask({ heading: `Remove the passkey "${passkey.name}"?`, confirm: "Remove" })) !== "confirm") return;
    await actions.remove(passkey.id);
  }

  async function signOutOthers() {
    if ((await ask({ heading: "Sign out every other device?", confirm: "Sign out everywhere" })) !== "confirm") return;
    await actions.signOutOthers();
  }

  return (
    <section className="overflow-hidden rounded-2xl border">
      <div className="border-b px-5 py-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Security</h2>
      </div>

      <div className="space-y-4 px-5 py-4 text-sm">
        {security.signIns.length > 0 ? (
          <AdminLink
            href={ADMIN_APPROVE_SIGN_IN_PATH}
            className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-amber-700 dark:text-amber-300"
          >
            <ShieldAlert className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 wrap-anywhere">Sign-in waiting — {security.signIns[0]!.device}</span>
          </AdminLink>
        ) : null}

        <PasskeyList passkeys={security.passkeys} busy={actions.busy} onRemove={remove} />

        <div className="flex flex-wrap gap-2">
          <AdminButton size="sm" variant="solid" onClick={() => setAdding(true)} disabled={actions.busy}>
            <KeyRound className="size-3.5" />
            Add a passkey
          </AdminButton>
          <AdminButton size="sm" onClick={signOutOthers} disabled={actions.busy}>
            <LogOut className="size-3.5" />
            Sign out everywhere
          </AdminButton>
        </div>
      </div>

      <AdminActionFeedback feedback={actions.feedback} />

      {adding ? <AddPasskeyDialog busy={actions.busy} onAdd={actions.add} onClose={() => setAdding(false)} /> : null}
      {pending ? (
        <ChoiceDialog
          heading={pending.question.heading}
          options={[{ answer: "confirm", label: pending.question.confirm, variant: "danger" }]}
          onAnswer={pending.answer}
          cancel="cancel"
        />
      ) : null}
    </section>
  );
}
