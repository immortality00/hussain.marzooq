"use client";

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
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send"}
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={loading}
        className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
      >
        Reset
      </button>
    </div>
  );
}