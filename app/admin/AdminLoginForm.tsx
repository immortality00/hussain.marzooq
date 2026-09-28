"use client";

import type { KeyboardEvent } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";

export function AdminLoginForm({
  login,
  nextPath,
}: {
  login: (formData: FormData) => void;
  nextPath: string;
}) {
  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={login} className="mt-8 space-y-4">
      <input
        type="password"
        name="password"
        placeholder="Password"
        className={adminInputClasses()}
        autoComplete="current-password"
        onKeyDown={submitOnEnter}
        required
      />

      <input type="hidden" name="next" value={nextPath} />

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="remember" className={adminCheckboxClasses()} />
        Remember this device
      </label>

      <AdminButton type="submit" variant="solid" className="w-full">
        Login
      </AdminButton>
    </form>
  );
}
