"use client";

import { useCallback, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";
import { requestAdminLogin } from "@/lib/auth/admin-login";
import { isStandalone } from "@/lib/client/push-support";
import { NextPathField } from "./LoginNotice";
import { SecondStep } from "./SecondStep";
import { LoginError, SigningIn } from "./SigningIn";

const subscribeNever = () => () => {};

function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

export function AdminLoginForm() {
  const installed = useSyncExternalStore(subscribeNever, isStandalone, () => false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondStep, setSecondStep] = useState(false);

  const restart = useCallback((message: string) => {
    setSecondStep(false);
    setError(message);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    const result = await requestAdminLogin(new FormData(form));
    if (result.ok && "next" in result) {
      location.replace(result.next);
      return;
    }
    form.reset();
    setPending(false);
    if (result.ok) setSecondStep(true);
    else setError(result.message);
  }

  if (secondStep) return <SecondStep onRestart={restart} />;

  return (
    <form method="post" onSubmit={submit} className="mt-8 space-y-4">
      <LoginError message={error} />

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
