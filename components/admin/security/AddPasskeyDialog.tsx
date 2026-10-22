"use client";

import { useState, type FormEvent } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminInputClasses } from "@/components/admin/admin-input";
import { ModalPortal } from "@/components/shared/ModalPortal";

export function AddPasskeyDialog({
  busy,
  onAdd,
  onClose,
}: {
  busy: boolean;
  onAdd: (password: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !password) return;
    if (await onAdd(password)) onClose();
    else setPassword("");
  }

  return (
    <ModalPortal
      onClose={onClose}
      label="Add a passkey"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm space-y-4 rounded-2xl border bg-background p-5 shadow-xl"
      >
        <p className="text-sm font-semibold">Add a passkey</p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          className={adminInputClasses()}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AdminButton type="button" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" variant="solid" disabled={busy || !password}>
            Continue
          </AdminButton>
        </div>
      </form>
    </ModalPortal>
  );
}
