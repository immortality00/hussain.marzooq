"use client";

import type { PageSectionsMap, PageSectionsSlug } from "@/lib/server/page-sections";
import type { PageRow } from "../usePagesAdmin";
import { VisibilityGroup } from "./VisibilityGroup";
import { SeoPageForm, type SeoDraft } from "./SeoPageForm";
import { SectionsGroup } from "./SectionsGroup";

type SectionsData = PageSectionsMap[PageSectionsSlug];

export function PageRowCard({
  row,
  isOpen,
  onToggleOpen,
  isActive,
  seo,
  sectionsData,
  dirty,
  isSaving,
  onVisibilityChange,
  onSeoChange,
  onSectionsChange,
  onSave,
  onDiscard,
}: {
  row: PageRow;
  isOpen: boolean;
  onToggleOpen: () => void;
  isActive: boolean;
  seo: SeoDraft;
  sectionsData: SectionsData | undefined;
  dirty: boolean;
  isSaving: boolean;
  onVisibilityChange: (next: boolean) => void;
  onSeoChange: (field: keyof SeoDraft, value: string) => void;
  onSectionsChange: (data: SectionsData) => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="rounded-2xl border">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <p className="text-sm font-medium">{row.label}</p>
        <span className="ml-4 shrink-0 text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="space-y-3 border-t px-4 pb-4 pt-3">
          {row.settingsSlug && (
            <VisibilityGroup isActive={isActive} onToggle={onVisibilityChange} />
          )}

          {row.seoSlug && <SeoPageForm draft={seo} onChange={onSeoChange} />}

          {row.sectionsSlug && sectionsData && (
            <SectionsGroup slug={row.sectionsSlug} data={sectionsData} onChange={onSectionsChange} />
          )}

          <div className="flex gap-2 pt-1">
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
      )}
    </div>
  );
}
