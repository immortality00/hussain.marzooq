"use client";

import { useSyncExternalStore, type KeyboardEvent } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";
import { isStandalone } from "@/lib/client/push-support";

const subscribeNever = () => () => {};

export function AdminLoginForm({
  login,
  nextPath,
}: {
  login: (formData: FormData) => void;
  nextPath: string;
}) {
  const installed = useSyncExternalStore(subscribeNever, isStandalone, () => false);

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
        <input
          key={installed ? "app" : "browser"}
          type="checkbox"
          name="remember"
          defaultChecked={installed}
          className={adminCheckboxClasses()}
        />
        Remember this device
      </label>

      <AdminButton type="submit" variant="solid" className="w-full">
        Login
      </AdminButton>
    </form>
  );
}
