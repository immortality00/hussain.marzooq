"use client";

import { useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { requestAdminLogin } from "@/lib/auth/admin-login";
import { isStandalone } from "@/lib/client/push-support";
import { NextPathField } from "./LoginNotice";

const subscribeNever = () => () => {};

function SigningIn({ pending }: { pending: boolean }) {
  if (!pending) return null;
  return createPortal(<LoadingScreen className="fixed inset-0 z-50 bg-background" />, document.body);
}

function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

export function AdminLoginForm() {
  const installed = useSyncExternalStore(subscribeNever, isStandalone, () => false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    const result = await requestAdminLogin(new FormData(form));
    if (result.ok) {
      location.replace(result.next);
      return;
    }
    form.reset();
    setPending(false);
    setError(result.message);
  }

  return (
    <form method="post" onSubmit={submit} className="mt-8 space-y-4">
      {error ? (
        <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <input
        type="password"
        name="password"
        placeholder="Password"
        className={adminInputClasses()}
        autoComplete="current-password"
        onKeyDown={submitOnEnter}
        required
      />

      <NextPathField />

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

      <SigningIn pending={pending} />
    </form>
  );
}
