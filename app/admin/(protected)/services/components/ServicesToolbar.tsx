"use client";

export default function ServicesToolbar({
  busy,
  onSyncInquiryCounts,
  onCreate,
  onSaveOrder,
}: {
  busy: boolean;
  onSyncInquiryCounts: () => void | Promise<void>;
  onCreate: () => void;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold">Services</h1>
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => void onSyncInquiryCounts()}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60"
        >
          Sync Inquiry Counts
        </button>
        <button
          disabled={busy}
          onClick={onCreate}
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
        >
          Create
        </button>
        <button
          disabled={busy}
          onClick={() => void onSaveOrder()}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60"
        >
          Save Order
        </button>
      </div>
    </div>
  );
}