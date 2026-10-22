"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { SignInRequestCard } from "@/components/admin/security/SignInRequestCard";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAdminSlice } from "@/hooks/useAdminData";
import { approveSignIn, rejectSignIn } from "@/lib/client/admin-security-api";
import type { AdminSecurity } from "@/lib/server/admin-security-state";

export default function ApproveSignInClient() {
  const [security, setSecurity] = useAdminSlice("security");
  const [busy, setBusy] = useState(false);
  const { feedback, run } = useAdminAction({ autoDismiss: true });

  async function act(fn: () => Promise<AdminSecurity | null>, successText: string) {
    setBusy(true);
    const next = await run(fn, { successText });
    if (next) setSecurity(next);
    setBusy(false);
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader title="Approve sign-in" />
      {security.signIns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sign-in waiting.</p>
      ) : (
        <div className="space-y-4">
          {security.signIns.map((request) => (
            <SignInRequestCard
              key={request.id}
              request={request}
              busy={busy}
              onApprove={(choice) => act(() => approveSignIn(request.id, choice), "Sign-in approved.")}
              onReject={() => act(() => rejectSignIn(request.id), "Sign-in refused.")}
            />
          ))}
        </div>
      )}
      <AdminActionFeedback feedback={feedback} />
    </main>
  );
}
