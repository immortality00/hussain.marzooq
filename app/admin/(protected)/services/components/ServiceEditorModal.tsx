"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import type { Service, ServiceCategory } from "../lib/types";

type WidgetResult = { info?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function getString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export default function ServiceEditorModal({
  open,
  onClose,
  onSave,
  categories,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Service>) => Promise<void>;
  categories: ServiceCategory[];
  initial: Service | null;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("others");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [currency, setCurrency] = useState("AED");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  const categoriesClean = useMemo(() => {
    // Remove any legacy "general" from dropdown
    const filtered = categories.filter((c) => c.slug !== "general");
    return filtered.sort((a, b) => a.order - b.order);
  }, [categories]);

  const hasOthers = useMemo(() => categoriesClean.some((c) => c.slug === "others"), [categoriesClean]);

  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setSlug(initial?.slug ?? "");

    const cat = (initial?.category ?? "").trim();
    if (cat && cat !== "general") setCategory(cat);
    else setCategory(hasOthers ? "others" : (categoriesClean[0]?.slug ?? "others"));

    setDescription(initial?.description ?? "");
    setStartingPrice(
      initial?.startingPrice === null || initial?.startingPrice === undefined ? "" : String(initial.startingPrice)
    );
    setCurrency(initial?.currency ?? "AED");
    setImageUrl(initial?.imageUrl ?? "");
    setIsActive(initial?.isActive ?? true);
  }, [open, initial, categoriesClean, hasOthers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-background p-6 text-foreground shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{initial ? "Edit Service" : "Create Service"}</h2>
          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="mb-1 text-muted-foreground">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-muted-foreground">Slug</div>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-muted-foreground">Category</div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            >
              {categoriesClean.map((c) => (
                <option key={c.id} value={c.slug} disabled={!c.isActive}>
                  {c.name} ({c.slug}){c.isActive ? "" : " — inactive"}
                </option>
              ))}
              {!hasOthers ? <option value="others">Others (others)</option> : null}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-muted-foreground">Currency</div>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-muted-foreground">Starting Price</div>
            <input
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              placeholder="Leave empty for null"
            />
          </label>

          <div className="text-sm space-y-2">
            <div className="text-muted-foreground">Service Image</div>

            <div className="flex items-center gap-2">
              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary-params"
                options={{ folder: "hm_visuals/services", multiple: false, resourceType: "image" }}
                onSuccess={(result: unknown) => {
                  const r = result as WidgetResult;
                  const info = r?.info;
                  if (!isRecord(info)) return;
                  const secureUrl = getString((info as Record<string, unknown>).secure_url);
                  if (secureUrl) setImageUrl(secureUrl);
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    Upload Image
                  </button>
                )}
              </CldUploadWidget>

              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Clear
              </button>
            </div>

            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring"
              placeholder="or paste image URL"
            />
          </div>

          <label className="col-span-2 text-sm">
            <div className="mb-1 text-muted-foreground">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-28 w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>

        {imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={imageUrl}
              alt="Service image preview"
              width={1400}
              height={800}
              className="h-56 w-full object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const sp = startingPrice.trim() === "" ? null : Number(startingPrice);
                await onSave({
                  name: name.trim(),
                  slug: slug.trim(),
                  category: category.trim() || "others",
                  description: description.trim(),
                  currency: currency.trim() || "AED",
                  startingPrice: sp !== null && Number.isFinite(sp) ? sp : null,
                  imageUrl: imageUrl.trim(),
                  isActive,
                });
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}