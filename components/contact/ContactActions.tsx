"use client";

import { Button } from "@/components/shared/Button";

export default function ContactActions({
  loading,
  onSubmit,
  onReset,
}: {
  loading: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <Button variant="solid" onClick={onSubmit} disabled={loading}>
        {loading ? "Sending…" : "Send"}
      </Button>

      <Button onClick={onReset} disabled={loading}>
        Reset
      </Button>
    </div>
  );
}