"use client";

import { useEffect } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { checkApproval, type StepResult } from "@/lib/auth/admin-second-step";

const CHECK_EVERY_MS = 2000;

export function ApprovalWait({
  number,
  onDone,
  onCancel,
}: {
  number: number;
  onDone: (result: StepResult) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const result = await checkApproval();
      if (stopped) return;
      if ("status" in result) timer = setTimeout(tick, CHECK_EVERY_MS);
      else onDone(result);
    };
    timer = setTimeout(tick, CHECK_EVERY_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="mt-8 space-y-6 text-center">
      <p aria-label={`Number ${number}`} className="font-mono text-6xl font-semibold tabular-nums tracking-tight">
        {number}
      </p>
      <div role="status" className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <span aria-hidden className="hm-spinner" />
        Waiting for approval…
      </div>
      <AdminButton type="button" variant="ghost" className="w-full" onClick={onCancel}>
        Cancel
      </AdminButton>
    </div>
  );
}
