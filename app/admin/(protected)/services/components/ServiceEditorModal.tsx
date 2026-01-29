"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Service, ServiceCategory } from "../lib/types";

export default function ServiceEditorModal({
  open,
  onClose,
  onSave,
  onDelete,
  categories,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Service>) => Promise<void>;
  onDelete: () => Promise<void>;
  categories: ServiceCategory[];
  initial: Service | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startingPrice, setStartingPrice] = useState(
    initial?.startingPrice === null || initial?.startingPrice === undefined ? "" : String(initial.startingPrice)
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [busy, setBusy] = useState(false);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive).sort((a, b) => a.order - b.order),
    [categories]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-black p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{initial ? "Edit Service" : "Create Service"}</h2>
          <button onClick={onClose} className="rounded-xl border px-3 py-2 text-sm hover:bg-white/5">
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="mb-1 opacity-70">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border bg-black px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Slug</div>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border bg-black px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Category</div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border bg-black px-3 py-2"
            >
              <option value="general">general</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Currency</div>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border bg-black px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Starting Price</div>
            <input
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border bg-black px-3 py-2"
              placeholder="Leave empty for null"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Image URL</div>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border bg-black px-3 py-2"
              placeholder="https://res.cloudinary.com/..."
            />
          </label>

          <label className="col-span-2 text-sm">
            <div className="mb-1 opacity-70">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-28 w-full rounded-xl border bg-black px-3 py-2"
            />
          </label>

          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        {imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <Image
              src={imageUrl}
              alt="Preview"
              width={1400}
              height={800}
              className="h-56 w-full object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          {initial ? (
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onDelete();
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-white/5"
            >
              Delete
            </button>
          ) : (
            <div />
          )}

          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const sp = startingPrice.trim() === "" ? null : Number(startingPrice);
                await onSave({
                  name: name.trim(),
                  slug: slug.trim(),
                  category: category.trim() || "general",
                  description: description.trim(),
                  currency: currency.trim() || "AED",
                  startingPrice: Number.isFinite(sp as number) ? (sp as number) : null,
                  imageUrl: imageUrl.trim(),
                  isActive,
                });
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-xl bg-white px-4 py-2 text-sm text-black hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}