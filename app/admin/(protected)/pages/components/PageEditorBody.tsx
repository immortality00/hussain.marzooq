"use client";

import type { PageSectionsMap, PageSectionsSlug } from "@/lib/server/page-sections";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";
import type { PageRow } from "../lib/rows";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { VisibilityGroup } from "./VisibilityGroup";
import { SeoPageForm, type SeoDraft } from "./SeoPageForm";
import { SectionsGroup } from "./SectionsGroup";
import { SearchProfileGroup } from "./SearchProfileGroup";
import { normalizeSearchProfile } from "@/lib/seo/search-profile";

type SectionsData = PageSectionsMap[PageSectionsSlug];

export function PageEditorBody({
  row,
  isActive,
  seo,
  sectionsData,
  dirty,
  isSaving,
  feedback,
  onVisibilityChange,
  onSeoChange,
  onSectionsChange,
  onSave,
  onDiscard,
}: {
  row: PageRow;
  isActive: boolean;
  seo: SeoDraft;
  sectionsData: SectionsData | undefined;
  dirty: boolean;
  isSaving: boolean;
  feedback: AdminActionFeedbackState;
  onVisibilityChange: (next: boolean) => void;
  onSeoChange: (field: keyof SeoDraft, value: string) => void;
  onSectionsChange: (data: SectionsData) => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div>
      <div className="space-y-3">
        {row.settingsSlug && <VisibilityGroup isActive={isActive} onToggle={onVisibilityChange} />}

        {row.seoSlug && (
          <SeoPageForm
            draft={seo}
            onChange={onSeoChange}
            detailPage={row.seoDetailPage}
            detailToken={row.seoSlug?.endsWith("-tag") ? "tag" : "name"}
            shareImage={row.key !== "services-detail"}
          />
        )}

        {row.sectionsSlug === "about" && sectionsData && (
          <SearchProfileGroup
            profile={normalizeSearchProfile((sectionsData as PageSectionsMap["about"]).profile)}
            onChange={(profile) =>
              onSectionsChange({ ...(sectionsData as PageSectionsMap["about"]), profile })
            }
          />
        )}

        {row.sectionsSlug && sectionsData && (
          <SectionsGroup slug={row.sectionsSlug} data={sectionsData} onChange={onSectionsChange} />
        )}
      </div>

      <div className="mt-4 space-y-3 border-t pt-4">
        <AdminActionFeedback feedback={feedback} className="" />

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!dirty || isSaving}
            onClick={onSave}
            className={adminButtonClasses("solid", "md")}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={onDiscard}
              className={adminButtonClasses("default", "md")}
            >
              Discard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
