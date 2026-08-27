"use client";

import Link from "next/link";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import MediaAppearancesSection from "./components/MediaAppearancesSection";
import MediaAssetSection from "./components/MediaAssetSection";
import MediaDetailsSection from "./components/MediaDetailsSection";
import MediaNftSection from "./components/MediaNftSection";
import MediaPlacementSection from "./components/MediaPlacementSection";
import { getCloudinaryMediaFolderForCategory } from "@/lib/cloudinary-folders";
import { useMediaEditorController } from "./lib/useMediaEditorController";

export default function AdminMediaPage() {
  const { editor, busy, busyAction, banner, save, remove, startNewUpload } =
    useMediaEditorController();

  const allowEmbed =
    (editor.primaryCategory === "videography" || editor.primaryCategory === "showreel") &&
    !editor.isNft;

  const uploadFolder = getCloudinaryMediaFolderForCategory(editor.primaryCategory);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <AdminPageHeader
        title={editor.editingId ? "Edit Media" : "Upload Media"}
        actions={
          <>
            <Link
              href="/admin/media/list"
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
            >
              View list
            </Link>

            {editor.editingId ? (
              <button
                type="button"
                onClick={startNewUpload}
                disabled={busy}
                className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                New upload
              </button>
            ) : null}
          </>
        }
      />

      <AdminActionFeedback feedback={banner} />

      <div className="mt-8 space-y-6">
        <MediaPlacementSection
          primaryCategory={editor.primaryCategory}
          setPrimaryCategory={editor.setPrimaryCategory}
          categories={editor.categories}
          toggleCategory={editor.toggleCategory}
          isPublic={editor.isPublic}
          setIsPublic={editor.setIsPublic}
        />

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

        <MediaAppearancesSection
          appearances={editor.appearances}
          addAppearance={editor.addAppearance}
          updateAppearance={editor.updateAppearance}
          removeAppearance={editor.removeAppearance}
        />

        <section className="rounded-3xl border p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === "delete" ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}