"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import type { NftItem } from "../lib/types";

type WidgetResult = { info?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default function NftEditorModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: NftItem | null;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [editionType, setEditionType] = useState<"1/1" | "limited" | "open">("1/1");
  const [editionsTotal, setEditionsTotal] = useState("");
  const [editionsRemaining, setEditionsRemaining] = useState("");
  const [status, setStatus] = useState<"available" | "sold" | "coming-soon">("available");
  const [marketplaceName, setMarketplaceName] = useState("");
  const [marketplaceUrl, setMarketplaceUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setSlug(initial?.slug ?? "");
    setDescription(initial?.description ?? "");
    setMediaUrl(initial?.mediaUrl ?? "");
    setMediaType(initial?.mediaType ?? "image");
    setPrice(initial?.price === null || initial?.price === undefined ? "" : String(initial.price));
    setCurrency(initial?.currency ?? "ETH");
    setEditionType(initial?.editionType ?? "1/1");
    setEditionsTotal(initial?.editionsTotal === null || initial?.editionsTotal === undefined ? "" : String(initial.editionsTotal));
    setEditionsRemaining(initial?.editionsRemaining === null || initial?.editionsRemaining === undefined ? "" : String(initial.editionsRemaining));
    setStatus(initial?.status ?? "available");
    setMarketplaceName(initial?.marketplaceName ?? "");
    setMarketplaceUrl(initial?.marketplaceUrl ?? "");
    setIsPublished(initial?.isPublished ?? true);
  }, [open, initial]);

  if (!open) return null;

  const previewIsVideo = mediaType === "video";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl border bg-background text-foreground shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <h2 className="text-xl font-semibold">{initial ? "Edit NFT" : "Create NFT"}</h2>
          <button onClick={onClose} className="rounded-xl border px-3 py-2 text-sm hover:bg-accent">Close</button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Slug</div>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>

            <label className="text-sm col-span-2">
              <div className="mb-1 text-muted-foreground">Description</div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-28 w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>

            <div className="text-sm col-span-2 space-y-2">
              <div className="text-muted-foreground">NFT Media</div>
              <div className="flex flex-wrap items-center gap-2">
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  options={{ folder: "hm_visuals/nfts", multiple: false, resourceType: "auto" }}
                  onSuccess={(result: unknown) => {
                    const r = result as WidgetResult;
                    const info = r?.info;
                    if (!isRecord(info)) return;
                    const secureUrl = getString(info.secure_url);
                    const resourceType = getString(info.resource_type);
                    if (!secureUrl) return;
                    setMediaUrl(secureUrl);
                    setMediaType(resourceType === "video" ? "video" : "image");
                  }}
                >
                  {({ open }) => (
                    <button type="button" onClick={() => open()} className="rounded-xl border px-3 py-2 text-sm hover:bg-accent">
                      Upload Media
                    </button>
                  )}
                </CldUploadWidget>

                <select value={mediaType} onChange={(e) => setMediaType(e.target.value === "video" ? "video" : "image")} className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring" placeholder="Paste media URL" />

              {mediaUrl ? (
                <div className="mt-2 overflow-hidden rounded-2xl border bg-muted">
                  {previewIsVideo ? (
                    <video className="h-64 w-full object-contain bg-black" controls preload="metadata" src={mediaUrl} />
                  ) : (
                    <Image src={mediaUrl} alt="NFT preview" width={1400} height={1000} className="h-64 w-full object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                  )}
                </div>
              ) : null}
            </div>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Price</div>
              <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="Leave empty for on request" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Currency</div>
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Edition Type</div>
              <select value={editionType} onChange={(e) => setEditionType((e.target.value as "1/1" | "limited" | "open") || "1/1")} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                <option value="1/1">1/1</option>
                <option value="limited">Limited</option>
                <option value="open">Open</option>
              </select>
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Status</div>
              <select value={status} onChange={(e) => setStatus((e.target.value as "available" | "sold" | "coming-soon") || "available")} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="coming-soon">Coming soon</option>
              </select>
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Editions Total</div>
              <input value={editionsTotal} onChange={(e) => setEditionsTotal(e.target.value)} inputMode="numeric" className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="Optional" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Editions Remaining</div>
              <input value={editionsRemaining} onChange={(e) => setEditionsRemaining(e.target.value)} inputMode="numeric" className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="Optional" />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Marketplace</div>
              <input value={marketplaceName} onChange={(e) => setMarketplaceName(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="Foundation / OpenSea / objkt ..." />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Marketplace URL</div>
              <input value={marketplaceUrl} onChange={(e) => setMarketplaceUrl(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="https://..." />
            </label>

            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Published on public page
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-background p-5">
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={busy} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60">Cancel</button>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onSave({
                    name: name.trim(),
                    slug: slug.trim(),
                    description: description.trim(),
                    mediaUrl: mediaUrl.trim(),
                    mediaType,
                    price: price.trim() === "" ? null : Number(price),
                    currency: currency.trim() || "ETH",
                    editionType,
                    editionsTotal: editionsTotal.trim() === "" ? null : Number(editionsTotal),
                    editionsRemaining: editionsRemaining.trim() === "" ? null : Number(editionsRemaining),
                    status,
                    marketplaceName: marketplaceName.trim() || null,
                    marketplaceUrl: marketplaceUrl.trim() || null,
                    isPublished,
                  });
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}