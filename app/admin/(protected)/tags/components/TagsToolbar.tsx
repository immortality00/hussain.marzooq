"use client";

export default function TagsToolbar({
  savingOrder,
  onSaveOrder,
}: {
  savingOrder: boolean;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Media tags power the discipline subpages. Drag to reorder. Deactivating a tag hides its
          subpage and chips but keeps it on existing media.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void onSaveOrder()}
        disabled={savingOrder}
        className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-60"
      >
        {savingOrder ? "Saving…" : "Save Order"}
      </button>
    </div>
  );
}
