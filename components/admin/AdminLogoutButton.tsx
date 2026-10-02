"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { logOutAdmin } from "@/lib/client/admin-logout";

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);
  const { feedback, setFeedback } = useAdminAction();

  async function logOut() {
    setBusy(true);
    setFeedback(null);
    const failure = await logOutAdmin();
    if (!failure) return;
    setBusy(false);
    setFeedback({ type: "err", text: failure });
  }

  return (
    <>
      <AdminButton type="button" variant="ghost" size="sm" onClick={logOut} disabled={busy}>
        Logout
      </AdminButton>
      <AdminActionFeedback feedback={feedback} />
    </>
  );
}
