"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CLOUDINARY_SERVICES_FOLDER } from "@/lib/cloudinary-folders";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { DiscardChangesDialog, useDiscardChanges } from "@/components/admin/choice-dialog/DiscardChangesDialog";
import { ModalPortal } from "@/components/shared/ModalPortal";
import { CloudinaryUploadButton } from "@/components/shared/upload/CloudinaryUploadButton";
import { useLatest } from "@/hooks/useLatest";
import { cleanupUploadedAsset } from "@/lib/client/cleanup-uploaded-asset";
import type { Service, ServiceCategory } from "../lib/types";
import { draftChanged, serviceDraftOf, type ServiceDraft } from "../lib/service-draft";
import { adminCheckboxClasses, adminInputClasses } from "@/components/admin/admin-input";

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
  const [draft, setDraft] = useState<ServiceDraft>(() => serviceDraftOf(null, []));
  const [busy, setBusy] = useState(false);
  const latestImageUrl = useLatest(draft.imageUrl);

  function set<K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function discardCurrentImage() {
    if (latestImageUrl.current) cleanupUploadedAsset({ url: latestImageUrl.current });
  }

  const categoriesClean = useMemo(() => {
    const filtered = categories.filter((c) => c.slug !== "general");
    return filtered.sort((a, b) => a.order - b.order);
  }, [categories]);

  const othersCategory = useMemo(
    () => categoriesClean.find((c) => c.slug === "others") ?? null,
    [categoriesClean]
  );

  const [seeded, setSeeded] = useState<{ initial: Service | null; start: ServiceDraft } | null>(null);

  if (!open && seeded) setSeeded(null);

  if (open && (!seeded || seeded.initial !== initial)) {
    const start = serviceDraftOf(initial, categoriesClean);
    setSeeded({ initial, start });
    setDraft(start);
  }

  const discard = useDiscardChanges(seeded !== null && draftChanged(seeded.start, draft), onClose);

  if (!open) return null;

  const heading = initial ? "Edit Service" : "Create Service";
  const selectedCategory =
    categoriesClean.find((c) => c.id === draft.categoryId) ?? othersCategory ?? null;

  function requestClose() {
    if (!busy) void discard.requestClose();
  }

  return (
    <>
      <ModalPortal
        onClose={requestClose}
        closeOnEscape={!discard.asking}
        label={heading}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      >
        <div
          className="w-full max-w-2xl rounded-3xl border bg-background text-foreground shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b p-5">
            <h2 className="text-xl font-semibold">{heading}</h2>
            <button onClick={onClose} className={adminButtonClasses("default", "md")}>
              Close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5" data-lenis-prevent>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                <div className="mb-1 text-muted-foreground">Name</div>
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={adminInputClasses()}
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-muted-foreground">Slug</div>
                <input
                  value={draft.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  className={adminInputClasses()}
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-muted-foreground">Category</div>
                <select
                  value={draft.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className={adminInputClasses()}
                >
                  {categoriesClean.map((c) => (
                    <option key={c.id} value={c.id} disabled={!c.isActive}>
                      {c.name} ({c.slug}){c.isActive ? "" : " — inactive"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="mb-1 text-muted-foreground">Currency</div>
                <input
                  value={draft.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className={adminInputClasses()}
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-muted-foreground">Starting Price</div>
                <input
                  value={draft.startingPrice}
                  onChange={(e) => set("startingPrice", e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  className={adminInputClasses()}
                  placeholder="Leave empty for null"
                />
              </label>

              <div className="text-sm space-y-2 col-span-2">
                <div className="text-muted-foreground">Service Image</div>
                <div className="flex items-center gap-2">
                  <CloudinaryUploadButton
                    folder={CLOUDINARY_SERVICES_FOLDER}
                    accept="image/*"
                    label="Upload Image"
                    onUploaded={(u) => {
                      discardCurrentImage();
                      set("imageUrl", u.secureUrl);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      discardCurrentImage();
                      set("imageUrl", "");
                    }}
                    className={adminButtonClasses("default", "md")}
                  >
                    Clear
                  </button>
                </div>

                <input
                  value={draft.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  className={adminInputClasses("md", "md:text-xs")}
                  placeholder="or paste image URL"
                />

                {draft.imageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border bg-muted">
                    <Image
                      src={draft.imageUrl}
                      alt="Service image preview"
                      width={1400}
                      height={800}
                      className="h-48 w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                ) : null}
              </div>

              <label className="col-span-2 text-sm">
                <div className="mb-1 text-muted-foreground">Description</div>
                <textarea
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={adminInputClasses("md", "h-28")}
                />
              </label>

              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" className={adminCheckboxClasses()} checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                Active
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 border-t bg-background p-5">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={busy}
                className={adminButtonClasses("default", "md")}
              >
                Cancel
              </button>

              <button
                disabled={busy || !selectedCategory}
                onClick={async () => {
                  if (!selectedCategory) return;

                  setBusy(true);
                  try {
                    const sp = draft.startingPrice.trim() === "" ? null : Number(draft.startingPrice);

                    await onSave({
                      name: draft.name.trim(),
                      slug: draft.slug.trim(),
                      categoryId: selectedCategory.id,
                      description: draft.description.trim(),
                      currency: draft.currency.trim() || "AED",
                      startingPrice: sp !== null && Number.isFinite(sp) ? sp : null,
                      imageUrl: draft.imageUrl.trim(),
                      isActive: draft.isActive,
                    });
                  } finally {
                    setBusy(false);
                  }
                }}
                className={adminButtonClasses("solid", "md")}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      <DiscardChangesDialog dialog={discard.dialog} />
    </>
  );
}
