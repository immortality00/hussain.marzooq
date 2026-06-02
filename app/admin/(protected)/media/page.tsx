"use client";

import Link from "next/link";
import MediaAppearancesSection from "./components/MediaAppearancesSection";
import MediaAssetSection from "./components/MediaAssetSection";
import MediaDetailsSection from "./components/MediaDetailsSection";
import MediaNftSection from "./components/MediaNftSection";
import MediaPlacementSection from "./components/MediaPlacementSection";
import { useMediaEditorController } from "./lib/useMediaEditorController";

export default function AdminMediaPage() {
  const { editor, busy, banner, save, remove, startNewUpload } = useMediaEditorController();

  const allowEmbed = editor.primaryCategory === "videography" && !editor.isNft;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {editor.editingId ? "Edit Media" : "Upload Media"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Category first. The form adapts to the selected media destination.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/media/list"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            View list
          </Link>

          {editor.editingId ? (
            <button
              type="button"
              onClick={startNewUpload}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              New upload
            </button>
          ) : null}
        </div>
      </div>

      {banner ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "ok"
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

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
          location={editor.location}
          setLocation={editor.setLocation}
          event={editor.event}
          setEvent={editor.setEvent}
          tagsText={editor.tagsText}
          setTagsText={editor.setTagsText}
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
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
            >
              {editor.editingId ? "Update" : "Save"}
            </button>

            {editor.editingId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10 disabled:opacity-60"
              >
                Delete
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}