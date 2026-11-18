"use client";

import { WizardSummaryRow } from "@/components/admin/wizard/WizardSummaryRow";
import { WizardTabs } from "@/components/admin/wizard/WizardTabs";
import { getCloudinaryMediaFolderForCategory } from "@/lib/cloudinary-folders";
import { toEmbedUrl } from "@/lib/video-embed";
import type { useMediaEditorController } from "../lib/useMediaEditorController";
import MediaAppearancesSection from "./MediaAppearancesSection";
import MediaAssetSection from "./MediaAssetSection";
import MediaDetailsSection from "./MediaDetailsSection";
import MediaNftSection from "./MediaNftSection";
import MediaPlacementSection from "./MediaPlacementSection";
import { MediaWizardActions } from "./MediaWizardActions";
import { MediaWizardPreview } from "./MediaWizardPreview";
import { PublishScheduleField } from "./PublishScheduleField";

type Editor = ReturnType<typeof useMediaEditorController>["editor"];
type BusyAction = ReturnType<typeof useMediaEditorController>["busyAction"];

const STEPS = ["Category", "Media", "Details", "Appearances", "Review"] as const;

// An item being edited opens on Details; a new upload starts at Category.
export const DETAILS_STEP = 2;

export default function MediaWizard({
  editor,
  busy,
  busyAction,
  save,
  remove,
  step,
  onStep,
}: {
  editor: Editor;
  busy: boolean;
  busyAction: BusyAction;
  save: () => void | Promise<void>;
  remove: () => void | Promise<void>;
  step: number;
  onStep: (step: number) => void;
}) {
  const allowEmbed =
    (editor.primaryCategory === "videography" || editor.primaryCategory === "showreel") &&
    !editor.isNft;
  const uploadFolder = getCloudinaryMediaFolderForCategory(editor.primaryCategory);
  const posterUrl =
    editor.savedPoster && toEmbedUrl(editor.embedUrl) === editor.savedPoster.embedUrl
      ? editor.savedPoster.url
      : null;

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
      <WizardTabs steps={STEPS} step={step} onStep={onStep} />

      {step >= 2 ? (
        <div className="mt-3 flex justify-end">
          <MediaWizardPreview
            mode={editor.mode}
            uploaded={editor.uploaded}
            embedUrl={editor.embedUrl}
            posterUrl={posterUrl}
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
            privateGalleryTitles={editor.privateGalleryTitles}
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
              <WizardSummaryRow label="Title" value={editor.title || "—"} />
              <WizardSummaryRow label="Category" value={editor.primaryCategory ?? "—"} />
              <WizardSummaryRow label="Visibility" value={editor.isPublic ? "Public" : "Hidden"} />
              <WizardSummaryRow
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
              <WizardSummaryRow label="Tags" value={String(editor.selectedTagSlugs.length)} />
              <WizardSummaryRow label="Appearances" value={String(editor.appearances.length)} />
            </dl>
            {editor.isPublic && editor.privateGalleryTitles.length === 0 ? (
              <div className="mt-5 border-t pt-5">
                <PublishScheduleField value={editor.schedule} onChange={editor.setSchedule} />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <MediaWizardActions
        editing={Boolean(editor.editingId)}
        isFirst={step === 0}
        isLast={isLast}
        busy={busy}
        busyAction={busyAction}
        blockedReason={blockedReason}
        onBack={() => onStep(Math.max(0, step - 1))}
        onNext={() => onStep(Math.min(STEPS.length - 1, step + 1))}
        onSave={() => void save()}
        onDelete={() => void remove()}
      />
    </div>
  );
}
