"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { CloudinaryMultiUploadButton } from "@/components/admin/CloudinaryMultiUploadButton";
import { WizardTabs } from "@/components/admin/wizard/WizardTabs";
import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import { useAdminAction } from "@/hooks/useAdminAction";
import { getCloudinaryMediaFolderForCategory } from "@/lib/cloudinary-folders";
import MediaAppearancesSection from "../components/MediaAppearancesSection";
import MediaPeoplePicker from "../components/MediaPeoplePicker";
import MediaPlacementSection from "../components/MediaPlacementSection";
import TagMultiSelect from "../components/TagMultiSelect";
import { findFirstAppearanceError, MEDIA_CATEGORIES } from "../lib/utils";
import { type BatchFile, useBatchMediaState } from "./lib/useBatchMediaState";

const STEPS = ["Category", "Files", "Details", "Appearances", "Review"] as const;

const BATCH_CATEGORY_OPTIONS = MEDIA_CATEGORIES.filter((c) => c.key !== "nft");

export default function BatchMediaClient() {
  const router = useRouter();
  const s = useBatchMediaState();
  const { feedback, notify, setFeedback } = useAdminAction();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const uploadFolder = getCloudinaryMediaFolderForCategory(s.primaryCategory);

  const blockedReason =
    step === 0 && !s.primaryCategory
      ? "Choose a category to continue."
      : step === 1 && s.files.length === 0
        ? "Add at least one file to continue."
        : null;

  const isLast = step === STEPS.length - 1;

  function buildPayload(file: BatchFile) {
    const yearNum = s.year.trim() ? Number(s.year.trim()) : null;
    const year = yearNum !== null && Number.isFinite(yearNum) ? yearNum : null;

    return {
      type: file.resourceType === "video" ? "video" : "image",
      title: file.title.trim(),
      description: file.description.trim() || null,
      location: s.location.trim() || null,
      locationId: s.locationId,
      locationLat: s.locationLat,
      locationLon: s.locationLon,
      locationCountryCode: s.locationCountryCode,
      event: s.event.trim() || null,
      year,
      tags: s.tags,
      categories: s.categories,
      peopleIds: s.peopleIds,
      isPublic: s.isPublic,
      appearances: s.appearances,
      secureUrl: file.secureUrl,
      publicId: file.publicId,
      resourceType: file.resourceType,
    };
  }

  async function createOne(file: BatchFile): Promise<{ id: string; error?: undefined } | { id?: undefined; error: string }> {
    const res = await fetch("/api/media/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(file)),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok || !data?.ok) return { error: data?.error ?? "Save failed." };
    return { id: data.id ?? "" };
  }

  async function save() {
    if (saving) return;

    if (s.categories.length === 0) {
      notify("err", "Choose a category first.");
      return;
    }
    if (s.files.length === 0) {
      notify("err", "Add at least one file.");
      return;
    }
    const untitled = s.files.find((f) => !f.title.trim());
    if (untitled) {
      notify("err", `Every file needs a title (“${untitled.originalFilename}” is blank).`);
      return;
    }
    const appearanceError = findFirstAppearanceError(s.appearances);
    if (appearanceError) {
      const label = appearanceError.kind === "exhibited" ? "Exhibition" : "Feature";
      notify("err", `${label} #${appearanceError.index + 1}: ${appearanceError.message}`);
      return;
    }

    setSaving(true);
    notify("info", `Creating ${s.files.length} media…`);

    const filesToSave = s.files;
    const results = await Promise.allSettled(filesToSave.map((f) => createOne(f)));

    const failed: string[] = [];
    for (let i = 0; i < results.length; i += 1) {
      const file = filesToSave[i];
      const r = results[i];
      if (r.status === "fulfilled" && r.value.id !== undefined) {
        s.removeFile(file.id);
      } else {
        const reason =
          r.status === "rejected"
            ? r.reason instanceof Error
              ? r.reason.message
              : "Network error"
            : r.value.error;
        failed.push(`${file.title.trim() || file.originalFilename}: ${reason}`);
      }
    }

    setSaving(false);

    const created = filesToSave.length - failed.length;

    if (failed.length === 0) {
      notify("ok", `✅ Created ${created} media.`);
      s.resetAll();
      setStep(0);
      router.refresh();
    } else {
      notify(
        "err",
        `Created ${created} of ${filesToSave.length}. Failed: ${failed.slice(0, 5).join(" · ")}${
          failed.length > 5 ? ` · +${failed.length - 5} more` : ""
        }`
      );
    }
  }

  return (
    <div className="mt-4">
      <AdminActionFeedback feedback={feedback} />

      <WizardTabs steps={STEPS} step={step} onStep={setStep} />

      <div className="mt-5">
        {step === 0 ? (
          <MediaPlacementSection
            primaryCategory={s.primaryCategory}
            setPrimaryCategory={s.setPrimaryCategory}
            categories={s.categories}
            toggleCategory={s.toggleCategory}
            isPublic={s.isPublic}
            setIsPublic={s.setIsPublic}
            categoryOptions={BATCH_CATEGORY_OPTIONS}
          />
        ) : null}

        {step === 1 ? (
          <section className="space-y-4 rounded-3xl border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <CloudinaryMultiUploadButton
                folder={uploadFolder}
                disabled={!s.primaryCategory}
                onUploaded={(files) => {
                  setFeedback(null);
                  s.addFiles(files);
                }}
                onError={(msg) => notify("err", msg)}
              />
              {s.files.length ? (
                <span className="text-xs text-muted-foreground">
                  {s.files.length} file{s.files.length > 1 ? "s" : ""} ready
                </span>
              ) : null}
            </div>

            {s.files.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No files selected yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.files.map((f) => (
                  <FileThumb key={f.id} file={f} onRemove={() => s.removeFile(f.id)} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4 rounded-3xl border p-5">
            <p className="text-xs text-muted-foreground">
              These apply to every file in the batch. Titles are set per file on the Review step.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <LocationSearch
                  selectedLocation={s.selectedLocation}
                  onSelect={s.setLocationFromOption}
                  onClear={s.clearLocation}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Event</label>
                <input
                  value={s.event}
                  onChange={(e) => s.setEvent(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <input
                  value={s.year}
                  onChange={(e) => s.setYear(e.target.value)}
                  inputMode="numeric"
                  placeholder="2026"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <TagMultiSelect
                selectedSlugs={s.selectedTagSlugs}
                addTag={s.addTag}
                removeTag={s.removeTag}
              />
              <div className="md:col-span-2">
                <MediaPeoplePicker
                  selectedPeopleIds={s.selectedPeopleIds}
                  selectedPeopleNames={s.selectedPeopleNames}
                  setSelectedPeople={s.setSelectedPeople}
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <MediaAppearancesSection
            appearances={s.appearances}
            addAppearance={s.addAppearance}
            updateAppearance={s.updateAppearance}
            removeAppearance={s.removeAppearance}
          />
        ) : null}

        {step === 4 ? (
          <section className="space-y-4 rounded-3xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium">
                Review {s.files.length} file{s.files.length === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.primaryCategory ?? "—"} · {s.isPublic ? "Public" : "Hidden"} · {s.tags.length} tag
                {s.tags.length === 1 ? "" : "s"} · {s.people.length} people
              </div>
            </div>

            {s.files.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No files to save — add some on the Files step.
              </div>
            ) : (
              <div className="space-y-3">
                {s.files.map((f) => (
                  <div key={f.id} className="flex gap-3 rounded-2xl border p-3">
                    <FileThumb file={f} compact />
                    <div className="flex-1 space-y-2">
                      <input
                        value={f.title}
                        onChange={(e) => s.updateFile(f.id, { title: e.target.value })}
                        placeholder="Title"
                        aria-invalid={!f.title.trim() ? true : undefined}
                        className={`w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
                          !f.title.trim() ? "border-red-500/70 focus:ring-red-500" : ""
                        }`}
                      />
                      <textarea
                        value={f.description}
                        onChange={(e) => s.updateFile(f.id, { description: e.target.value })}
                        placeholder="Description (optional)"
                        className="h-16 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => s.removeFile(f.id)}
                      className={adminButtonClasses("danger", "sm")}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((v) => Math.max(0, v - 1))}
          className={adminButtonClasses("default", "md")}
        >
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            disabled={saving || s.files.length === 0}
            onClick={() => void save()}
            className={adminButtonClasses("solid", "md")}
          >
            {saving ? "Creating…" : `Create ${s.files.length} media`}
          </button>
        ) : (
          <button
            type="button"
            disabled={Boolean(blockedReason)}
            onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
            className={adminButtonClasses("solid", "md")}
          >
            Next
          </button>
        )}

        {blockedReason ? (
          <span className="text-xs text-muted-foreground">{blockedReason}</span>
        ) : null}
      </div>
    </div>
  );
}

function FileThumb({
  file,
  onRemove,
  compact = false,
}: {
  file: BatchFile;
  onRemove?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-muted"
          : "relative overflow-hidden rounded-2xl border bg-muted"
      }
    >
      {file.resourceType === "video" ? (
        <video
          className={compact ? "h-full w-full object-cover" : "aspect-video w-full object-cover"}
          preload="metadata"
          src={file.secureUrl}
        />
      ) : (
        <div className={compact ? "relative h-full w-full" : "relative aspect-video"}>
          <Image
            src={file.secureUrl}
            alt={file.originalFilename}
            fill
            className="object-cover"
            sizes={compact ? "112px" : "(max-width: 1024px) 100vw, 320px"}
          />
        </div>
      )}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 rounded-full bg-background/80 px-2 py-0.5 text-xs backdrop-blur hover:bg-background"
        >
          Remove
        </button>
      ) : null}

      {!compact ? (
        <div className="truncate px-2 py-1 text-[11px] text-muted-foreground">
          {file.originalFilename}
        </div>
      ) : null}
    </div>
  );
}
