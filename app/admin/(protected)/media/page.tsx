"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MediaAppearancesSection from "./components/MediaAppearancesSection";
import MediaAssetSection from "./components/MediaAssetSection";
import MediaDetailsSection from "./components/MediaDetailsSection";
import MediaNftSection from "./components/MediaNftSection";
import MediaPlacementSection from "./components/MediaPlacementSection";
import { deleteMediaItem, fetchMediaItem, buildMediaPayload, saveMediaItem } from "./lib/editor-actions";
import { useMediaEditorState } from "./lib/editor-state";
import type { MediaCategory } from "./lib/types";

const allowedCategories: MediaCategory[] = ["photography", "videography", "showreel", "nft", "art"];

export default function AdminMediaPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const editId = (sp.get("edit") ?? "").trim();
  const prefillCategory = (sp.get("category") ?? "").trim() as MediaCategory;

  const editor = useMediaEditorState();
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!editId && prefillCategory && editor.categories.length === 0 && allowedCategories.includes(prefillCategory)) {
      editor.setPrimaryCategory(prefillCategory);
    }
  }, [editId, prefillCategory, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;

    async function run() {
      setBanner(null);
      setBusy(true);
      try {
        const item = await fetchMediaItem(editId);
        if (!cancelled) editor.loadIntoState(item);
      } catch (e: unknown) {
        if (!cancelled) {
          setBanner({
            type: "err",
            text: e instanceof Error ? e.message : "Failed to load media.",
          });
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setBanner(null);

    if (!editor.title.trim()) {
      setBanner({ type: "err", text: "Title is required." });
      return;
    }

    if (editor.categories.length === 0) {
      setBanner({ type: "err", text: "Choose a category first." });
      return;
    }

    setBusy(true);
    try {
      const { payloadBase, payloadWithAsset } = buildMediaPayload({
        editingId: editor.editingId,
        mode: editor.mode,
        title: editor.title,
        description: editor.description,
        location: editor.location,
        event: editor.event,
        year: editor.year,
        tags: editor.tags,
        categories: editor.categories,
        people: editor.people,
        isPublic: editor.isPublic,
        appearances: editor.appearances,
        embedUrl: editor.embedUrl,
        uploaded: editor.uploaded,
        nftPrice: editor.nftPrice,
        nftCurrency: editor.nftCurrency,
        nftEditionType: editor.nftEditionType,
        nftEditionsTotal: editor.nftEditionsTotal,
        nftEditionsRemaining: editor.nftEditionsRemaining,
        nftOpenUntil: editor.nftOpenUntil,
        nftStatus: editor.nftStatus,
        nftMarketplaceUrl: editor.nftMarketplaceUrl,
      });

      const result = await saveMediaItem({
        editingId: editor.editingId,
        payloadBase,
        payloadWithAsset,
      });

      if (result.mode === "created") {
        setBanner({ type: "ok", text: "✅ Media saved successfully." });
        editor.resetFields(true, () => setBanner(null));
      } else {
        setBanner({ type: "ok", text: "✅ Updated successfully." });
        const reloaded = await fetchMediaItem(editor.editingId);
        editor.loadIntoState(reloaded);
        router.refresh();
      }
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Save failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!editor.editingId) return;
    const ok = confirm("Delete this media forever? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setBanner(null);
    try {
      await deleteMediaItem(editor.editingId);
      setBanner({ type: "ok", text: "✅ Deleted." });
      editor.resetFields(true, () => setBanner(null));
      router.push("/admin/media/list");
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Delete failed.",
      });
    } finally {
      setBusy(false);
    }
  }

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
              onClick={() => {
                editor.resetFields(false, () => setBanner(null));
                router.push("/admin/media");
              }}
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
            banner.type === "ok" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
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
          allowEmbed={!editor.isNft}
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
          peopleText={editor.peopleText}
          setPeopleText={editor.setPeopleText}
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
                onClick={() => void del()}
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