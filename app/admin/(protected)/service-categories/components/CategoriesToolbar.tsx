"use client";

export default function CategoriesToolbar({
  savingOrder,
  onSaveOrder,
}: {
  savingOrder: boolean;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Service Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Drag categories to reorder. Turning a category inactive deactivates linked services too.
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