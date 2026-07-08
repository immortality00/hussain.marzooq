"use client";

import type { PageSectionsMap, PageSectionsSlug } from "@/lib/server/page-sections";
import type { SectionImage } from "@/lib/page-sections-shared";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";
import type { PageRow } from "../usePagesAdmin";
import { VisibilityGroup } from "./VisibilityGroup";
import { CardImageGroup } from "./CardImageGroup";
import { SeoPageForm, type SeoDraft } from "./SeoPageForm";
import { SectionsGroup } from "./SectionsGroup";

type SectionsData = PageSectionsMap[PageSectionsSlug];

export function PageRowCard({
  row,
  isOpen,
  onToggleOpen,
  isActive,
  cardImage,
  seo,
  sectionsData,
  dirty,
  isSaving,
  feedback,
  onVisibilityChange,
  onCardImageChange,
  onSeoChange,
  onSectionsChange,
  onSave,
  onDiscard,
}: {
  row: PageRow;
  isOpen: boolean;
  onToggleOpen: () => void;
  isActive: boolean;
  cardImage: SectionImage | undefined;
  seo: SeoDraft;
  sectionsData: SectionsData | undefined;
  dirty: boolean;
  isSaving: boolean;
  feedback: AdminActionFeedbackState;
  onVisibilityChange: (next: boolean) => void;
  onCardImageChange: (image: SectionImage) => void;
  onSeoChange: (field: keyof SeoDraft, value: string) => void;
  onSectionsChange: (data: SectionsData) => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <p className="flex items-center gap-2 text-sm font-medium">
          {row.label}
          {dirty && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">
              Unsaved
            </span>
          )}
        </p>
        <span className="ml-4 shrink-0 text-xs text-muted-foreground">Edit</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
              <p className="text-sm font-semibold">{row.label}</p>
              <button
                type="button"
                onClick={onToggleOpen}
                className="rounded-xl border px-3 py-1.5 text-sm transition-colors hover:bg-accent/40"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5" data-lenis-prevent>
              {row.settingsSlug && (
                <VisibilityGroup isActive={isActive} onToggle={onVisibilityChange} />
              )}

              {row.settingsSlug && cardImage && (
                <CardImageGroup value={cardImage} onChange={onCardImageChange} />
              )}

              {row.seoSlug && (
                <SeoPageForm draft={seo} onChange={onSeoChange} detailPage={row.seoDetailPage} />
              )}

              {row.sectionsSlug && sectionsData && (
                <SectionsGroup slug={row.sectionsSlug} data={sectionsData} onChange={onSectionsChange} />
              )}
            </div>

            <div className="space-y-3 border-t px-5 py-4">
              <AdminActionFeedback feedback={feedback} className="" />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!dirty || isSaving}
                  onClick={onSave}
                  className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
                {dirty && (
                  <button
                    type="button"
                    onClick={onDiscard}
                    className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent/40"
                  >
                    Discard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
