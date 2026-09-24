"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { CloudinaryMultiUploadButton } from "@/components/shared/upload/CloudinaryMultiUploadButton";
import { WizardTabs } from "@/components/admin/wizard/WizardTabs";
import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import { useAdminAction } from "@/hooks/useAdminAction";
import { getCloudinaryMediaFolderForCategory } from "@/lib/cloudinary-folders";
import MediaAppearancesSection from "../components/MediaAppearancesSection";
import MediaPeoplePicker from "../components/MediaPeoplePicker";
import MediaPlacementSection from "../components/MediaPlacementSection";
import TagMultiSelect from "../components/TagMultiSelect";
import { findFirstAppearanceError, MEDIA_CATEGORIES } from "../lib/utils";
import { BatchItemThumb } from "./components/BatchItemThumb";
import { BatchLinkInput } from "./components/BatchLinkInput";
import { BatchReviewList } from "./components/BatchReviewList";
import { buildBatchPayload, createBatchItem } from "./lib/batch-save";
import { batchItemLabel, useBatchMediaState } from "./lib/useBatchMediaState";

const STEPS = ["Category", "Media", "Details", "Appearances", "Review"] as const;

const BATCH_CATEGORY_OPTIONS = MEDIA_CATEGORIES.filter((c) => c.key !== "nft");

export default function BatchMediaClient() {
  const router = useRouter();
  const s = useBatchMediaState();
  const { feedback, notify, setFeedback } = useAdminAction();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const uploadFolder = getCloudinaryMediaFolderForCategory(s.primaryCategory);
  const allowLinks =
    (s.categories.includes("videography") || s.categories.includes("showreel")) &&
    !s.categories.includes("photography");

  const blockedReason =
    step === 0 && !s.primaryCategory
      ? "Choose a category to continue."
      : step === 1 && s.items.length === 0
        ? allowLinks
          ? "Add a file or a link to continue."
          : "Add at least one file to continue."
        : null;

  const isLast = step === STEPS.length - 1;

  function sharedPayload() {
    const yearNum = s.year.trim() ? Number(s.year.trim()) : null;

    return {
      location: s.location.trim() || null,
      locationId: s.locationId,
      locationLat: s.locationLat,
      locationLon: s.locationLon,
      locationCountryCode: s.locationCountryCode,
      event: s.event.trim() || null,
      year: yearNum !== null && Number.isFinite(yearNum) ? yearNum : null,
      tags: s.tags,
      categories: s.categories,
      peopleIds: s.peopleIds,
      isPublic: s.isPublic,
      appearances: s.appearances,
    };
  }

  async function save() {
    if (saving) return;

    if (s.categories.length === 0) {
      notify("err", "Choose a category first.");
      return;
    }
    if (s.items.length === 0) {
      notify("err", "Add at least one file or link.");
      return;
    }
    const untitled = s.items.find((item) => !item.title.trim());
    if (untitled) {
      notify("err", `Every item needs a title (“${batchItemLabel(untitled)}” is blank).`);
      return;
    }
    const appearanceError = findFirstAppearanceError(s.appearances);
    if (appearanceError) {
      const label = appearanceError.kind === "exhibited" ? "Exhibition" : "Feature";
      notify("err", `${label} #${appearanceError.index + 1}: ${appearanceError.message}`);
      return;
    }

    setSaving(true);
    notify("info", `Creating ${s.items.length} media…`);

    const itemsToSave = s.items;
    const shared = sharedPayload();
    const failed: string[] = [];
    let postersMissing = 0;
    const results = await Promise.allSettled(
      itemsToSave.map((item) => createBatchItem(buildBatchPayload(item, shared)))
    );

    for (let i = 0; i < results.length; i += 1) {
      const item = itemsToSave[i];
      const r = results[i];
      const label = item.title.trim() || batchItemLabel(item);

      if (r.status === "rejected") {
        failed.push(`${label}: ${r.reason instanceof Error ? r.reason.message : "Network error"}`);
        continue;
      }
      if (!r.value.ok) {
        failed.push(`${label}: ${r.value.error}`);
        continue;
      }

      s.dropItem(item.id);
      if (r.value.posterMissing) postersMissing += 1;
    }

    setSaving(false);

    const created = itemsToSave.length - failed.length;
    const posterNote = postersMissing
      ? ` ${postersMissing} video thumbnail${postersMissing > 1 ? "s" : ""} couldn't be fetched.`
      : "";

    if (failed.length === 0) {
      notify("ok", `✅ Created ${created} media.${posterNote}`);
      s.resetAll();
      setStep(0);
      router.refresh();
    } else {
      notify(
        "err",
        `Created ${created} of ${itemsToSave.length}. Failed: ${failed.slice(0, 5).join(" · ")}${
          failed.length > 5 ? ` · +${failed.length - 5} more` : ""
        }${posterNote}`
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
              {s.items.length ? (
                <span className="text-xs text-muted-foreground">
                  {s.items.length} item{s.items.length > 1 ? "s" : ""} ready
                </span>
              ) : null}
            </div>

            {allowLinks ? (
              <BatchLinkInput
                knownEmbedUrls={s.items.flatMap((item) => (item.kind === "link" ? [item.embedUrl] : []))}
                onAdd={s.addLinks}
              />
            ) : null}

            {s.items.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                Nothing added yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((item) => (
                  <BatchItemThumb key={item.id} item={item} onRemove={() => s.removeItem(item.id)} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4 rounded-3xl border p-5">
            <p className="text-xs text-muted-foreground">
              These apply to every item in the batch. Titles are set per item on the Review step.
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
                Review {s.items.length} item{s.items.length === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.primaryCategory ?? "—"} · {s.isPublic ? "Public" : "Hidden"} · {s.tags.length} tag
                {s.tags.length === 1 ? "" : "s"} · {s.people.length} people
              </div>
            </div>

            {s.items.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                Nothing to save — add files or links on the Media step.
              </div>
            ) : (
              <BatchReviewList items={s.items} updateItem={s.updateItem} removeItem={s.removeItem} />
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
            disabled={saving || s.items.length === 0}
            onClick={() => void save()}
            className={adminButtonClasses("solid", "md")}
          >
            {saving ? "Creating…" : `Create ${s.items.length} media`}
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
