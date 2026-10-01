"use client";

import { AdminButton } from "@/components/admin/AdminButton";
import { forgetAdminData } from "@/lib/client/admin-store";

export function AdminLogoutButton() {
  return (
    <form action="/admin/logout" method="post" onSubmit={forgetAdminData}>
      <AdminButton type="submit" variant="ghost" size="sm">
        Logout
      </AdminButton>
    </form>
  );
}
