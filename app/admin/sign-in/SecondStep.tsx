"use client";

import { useCallback, useState } from "react";
import { Fingerprint, Smartphone } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { askForApproval, signInWithPasskey, type StepResult } from "@/lib/auth/admin-second-step";
import { ApprovalWait } from "./ApprovalWait";
import { LoginError, SigningIn } from "./SigningIn";

export function SecondStep({ onRestart }: { onRestart: (message: string) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState<number | null>(null);

  const settle = useCallback(
    (result: StepResult) => {
      if (result.ok) {
        setPending(true);
        location.replace(result.next);
        return;
      }
      setNumber(null);
      setPending(false);
      if (result.restart) onRestart(result.message);
      else setError(result.message);
    },
    [onRestart]
  );

  async function usePasskey() {
    setError(null);
    settle(await signInWithPasskey());
  }

  async function approveElsewhere() {
    setError(null);
    setPending(true);
    const result = await askForApproval();
    setPending(false);
    if (result.ok) setNumber(result.number);
    else settle(result);
  }

  if (number !== null) return <ApprovalWait number={number} onDone={settle} onCancel={() => setNumber(null)} />;

  return (
    <div className="mt-8 space-y-4">
      <LoginError message={error} />
      <AdminButton type="button" variant="solid" className="w-full" onClick={usePasskey} disabled={pending}>
        <Fingerprint className="size-4" />
        Use passkey
      </AdminButton>
      <AdminButton type="button" className="w-full" onClick={approveElsewhere} disabled={pending}>
        <Smartphone className="size-4" />
        Approve on another device
      </AdminButton>
      <SigningIn pending={pending} />
    </div>
  );
}
