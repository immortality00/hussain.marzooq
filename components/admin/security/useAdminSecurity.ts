"use client";

import { useState } from "react";
import { useAdminAction } from "@/hooks/useAdminAction";
import { setAdminSlice } from "@/lib/client/admin-store";
import { addPasskey, removePasskey, signOutEverywhere } from "@/lib/client/admin-security-api";
import type { AdminSecurity } from "@/lib/server/admin-security-state";

export function useAdminSecurity() {
  const [busy, setBusy] = useState(false);
  const { feedback, run } = useAdminAction({ autoDismiss: true });

  async function act(fn: () => Promise<AdminSecurity | null | void>, successText: string) {
    let done = false;
    setBusy(true);
    const security = await run(async () => {
      const result = await fn();
      done = true;
      return result;
    }, { successText });
    if (security) setAdminSlice("security", security);
    setBusy(false);
    return done;
  }

  return {
    busy,
    feedback,
    add: (password: string) => act(() => addPasskey(password), "Passkey added."),
    remove: (id: string) => act(() => removePasskey(id), "Passkey removed."),
    signOutOthers: () =>
      act(async () => {
        await signOutEverywhere();
      }, "Every other device is signed out."),
  };
}
