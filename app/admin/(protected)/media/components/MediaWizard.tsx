"use client";

import { useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { WizardTabs } from "@/components/admin/wizard/WizardTabs";
import { getCloudinaryMediaFolderForCategory } from "@/lib/cloudinary-folders";
import type { useMediaEditorController } from "../lib/useMediaEditorController";
import MediaAppearancesSection from "./MediaAppearancesSection";
import MediaAssetSection from "./MediaAssetSection";
import MediaDetailsSection from "./MediaDetailsSection";
import MediaNftSection from "./MediaNftSection";
import MediaPlacementSection from "./MediaPlacementSection";
import { MediaWizardPreview } from "./MediaWizardPreview";

type Editor = ReturnType<typeof useMediaEditorController>["editor"];
type BusyAction = ReturnType<typeof useMediaEditorController>["busyAction"];

const STEPS = ["Category", "Media", "Details", "Appearances", "Review"] as const;

export default function MediaWizard({
  editor,
  busy,
  busyAction,
  save,
  remove,
}: {
  editor: Editor;
  busy: boolean;
  busyAction: BusyAction;
  save: () => void | Promise<void>;
  remove: () => void | Promise<void>;
}) {
  const [step, setStep] = useState(0);

  const allowEmbed =
    (editor.primaryCategory === "videography" || editor.primaryCategory === "showreel") &&
    !editor.isNft;
  const uploadFolder = getCloudinaryMediaFolderForCategory(editor.primaryCategory);

  const hasCategory = editor.categories.length > 0;
  const hasTitle = editor.title.trim().length > 0;
  const blockedReason =
    step === 0 && !hasCategory
      ? "Choose a category to continue."
      : step === 2 && !hasTitle
        ? "A title is required to continue."
        : null;

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mt-4">
      <WizardTabs steps={STEPS} step={step} onStep={setStep} />

      {step >= 2 ? (
        <div className="mt-3 flex justify-end">
          <MediaWizardPreview
            mode={editor.mode}
            uploaded={editor.uploaded}
            embedUrl={editor.embedUrl}
          />
        </div>
      ) : null}

      <div className="mt-5">
        {step === 0 ? (
          <MediaPlacementSection
            primaryCategory={editor.primaryCategory}
            setPrimaryCategory={editor.setPrimaryCategory}
            categories={editor.categories}
            toggleCategory={editor.toggleCategory}
            isPublic={editor.isPublic}
            setIsPublic={editor.setIsPublic}
          />
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <MediaAssetSection
              mode={editor.mode}
              setMode={editor.setMode}
              uploaded={editor.uploaded}
              setUploaded={editor.setUploaded}
              embedUrl={editor.embedUrl}
              setEmbedUrl={editor.setEmbedUrl}
              allowEmbed={allowEmbed}
              uploadFolder={uploadFolder}
              canUpload={Boolean(editor.primaryCategory)}
            />

            {editor.isNft ? (
              <MediaNftSection
                nftPrice={editor.nftPrice}
                setNftPrice={editor.setNftPrice}
                nftCurrency={editor.nftCurrency}
                setNftCurrency={editor.setNftCurrency}
                nftEditionType={editor.nftEditionType}
                setNftEditionType={editor.setNftEditionType}
                nftEditionsTotal={editor.nftEditionsTotal}
                setNftEditionsTotal={editor.setNftEditionsTotal}
                nftEditionsRemaining={editor.nftEditionsRemaining}
                setNftEditionsRemaining={editor.setNftEditionsRemaining}
                nftOpenUntil={editor.nftOpenUntil}
                setNftOpenUntil={editor.setNftOpenUntil}
                nftStatus={editor.nftStatus}
                setNftStatus={editor.setNftStatus}
                nftMarketplaceUrl={editor.nftMarketplaceUrl}
                setNftMarketplaceUrl={editor.setNftMarketplaceUrl}
              />
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <MediaDetailsSection
            title={editor.title}
            setTitle={editor.setTitle}
            year={editor.year}
            setYear={editor.setYear}
            description={editor.description}
            setDescription={editor.setDescription}
            selectedLocation={editor.selectedLocation}
            setLocationFromOption={editor.setLocationFromOption}
            clearLocation={editor.clearLocation}
            event={editor.event}
            setEvent={editor.setEvent}
            selectedTagSlugs={editor.selectedTagSlugs}
            addTag={editor.addTag}
            removeTag={editor.removeTag}
            selectedPeopleIds={editor.selectedPeopleIds}
            selectedPeopleNames={editor.selectedPeopleNames}
            setSelectedPeople={editor.setSelectedPeople}
          />
        ) : null}

        {step === 3 ? (
          <MediaAppearancesSection
            appearances={editor.appearances}
            addAppearance={editor.addAppearance}
            updateAppearance={editor.updateAppearance}
            removeAppearance={editor.removeAppearance}
          />
        ) : null}

        {step === 4 ? (
          <section className="rounded-3xl border p-5">
            <div className="text-sm font-medium">Review</div>
            <dl className="mt-4 grid gap-2 text-sm">
              <SummaryRow label="Title" value={editor.title || "—"} />
              <SummaryRow label="Category" value={editor.primaryCategory ?? "—"} />
              <SummaryRow label="Visibility" value={editor.isPublic ? "Public" : "Hidden"} />
              <SummaryRow
                label="Media"
                value={
                  editor.mode === "embed"
                    ? editor.embedUrl
                      ? "Embed link"
                      : "None"
                    : editor.uploaded
                      ? editor.uploaded.resourceType === "video"
                        ? "Video"
                        : "Image"
                      : "None"
                }
              />
              <SummaryRow label="Tags" value={String(editor.selectedTagSlugs.length)} />
              <SummaryRow label="Appearances" value={String(editor.appearances.length)} />
            </dl>
          </section>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={adminButtonClasses("default", "md")}
        >
          Back
        </button>

        {isLast ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className={adminButtonClasses("solid", "md")}
            >
              {busyAction === "save"
                ? editor.editingId
                  ? "Updating…"
                  : "Creating…"
                : editor.editingId
                  ? "Update"
                  : "Save"}
            </button>

            {editor.editingId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className={adminButtonClasses("danger", "md")}
              >
                {busyAction === "delete" ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            disabled={Boolean(blockedReason)}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
