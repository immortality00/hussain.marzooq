"use client";

import { AdminButton } from "@/components/admin/AdminButton";
import { AdminStickyPortal } from "@/components/admin/AdminStickyStack";
import { adminSignInHref } from "@/lib/client/admin-store";
import { useAdminData, useAdminSignedOut } from "@/hooks/useAdminData";

export function AdminSessionNotice() {
  const signedOut = useAdminSignedOut();
  const data = useAdminData();
  if (!signedOut || !data) return null;

  return (
    <AdminStickyPortal>
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-card px-4 py-3 text-sm shadow-[var(--shadow-soft)]"
      >
        <span>Signed out.</span>
        <AdminButton size="sm" variant="solid" onClick={() => location.assign(adminSignInHref())}>
          Sign in
        </AdminButton>
      </div>
    </AdminStickyPortal>
  );
}
