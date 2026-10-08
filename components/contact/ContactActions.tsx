"use client";

import { Button } from "@/components/shared/Button";
import { FormStatus, type FormStatusState } from "@/components/shared/FormStatus";

export default function ContactActions({
  loading,
  status,
  onSubmit,
  onReset,
}: {
  loading: boolean;
  status: FormStatusState;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 space-y-3">
      <FormStatus status={status} />
      <div className="flex items-center gap-3">
        <Button variant="solid" onClick={onSubmit} disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </Button>

        <Button onClick={onReset} disabled={loading}>
          Reset
        </Button>
      </div>
    </div>
  );
}