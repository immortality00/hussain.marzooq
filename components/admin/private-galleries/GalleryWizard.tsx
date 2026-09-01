"use client";

import { useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { WizardTabs } from "@/components/admin/wizard/WizardTabs";
import { GalleryFormFields } from "./GalleryFormFields";
import { PrivateGalleryMediaPicker } from "./PrivateGalleryMediaPicker";
import type { usePrivateGalleriesAdmin } from "./usePrivateGalleriesAdmin";

type Admin = ReturnType<typeof usePrivateGalleriesAdmin>;

const STEPS = ["Details", "Media", "Review"] as const;

export function GalleryWizard({ admin }: { admin: Admin }) {
  const [step, setStep] = useState(0);

  const hasTitle = admin.title.trim().length > 0;
  const blockedReason = step === 0 && !hasTitle ? "A title is required to continue." : null;
  const isLast = step === STEPS.length - 1;

  return (
    <section className="mt-4">
      <WizardTabs steps={STEPS} step={step} onStep={setStep} />

      <div className="mt-5">
        {step === 0 ? (
          <GalleryFormFields
            editing={Boolean(admin.editingId)}
            title={admin.title}
            slug={admin.slug}
            description={admin.description}
            password={admin.password}
            expiresAtLocal={admin.expiresAtLocal}
            isActive={admin.isActive}
            onTitleChange={admin.setTitle}
            onSlugChange={admin.setSlug}
            onDescriptionChange={admin.setDescription}
            onPasswordChange={admin.setPassword}
            onExpiresAtLocalChange={admin.setExpiresAtLocal}
            onIsActiveChange={admin.setIsActive}
          />
        ) : null}

        {step === 1 ? (
          <PrivateGalleryMediaPicker
            selectedMediaIds={admin.selectedMediaIds}
            onToggleMedia={admin.toggleMedia}
          />
        ) : null}

        {step === 2 ? (
          <section className="rounded-[2rem] border p-5">
            <div className="text-sm font-medium">Review</div>
            <dl className="mt-4 grid gap-2 text-sm">
              <SummaryRow label="Title" value={admin.title || "—"} />
              <SummaryRow label="Link" value={admin.slug ? `/g/${admin.slug}` : "—"} />
              <SummaryRow label="Media items" value={String(admin.selectedMediaIds.length)} />
              <SummaryRow label="Status" value={admin.isActive ? "Active" : "Inactive"} />
              <SummaryRow label="Expires" value={admin.expiresAtLocal || "Never"} />
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
              disabled={admin.saving}
              onClick={() => void admin.save()}
              className={adminButtonClasses("solid", "md")}
            >
              {admin.saving
                ? admin.editingId
                  ? "Updating gallery…"
                  : "Creating gallery…"
                : admin.editingId
                  ? "Update gallery"
                  : "Create gallery"}
            </button>

            <button
              type="button"
              disabled={admin.actionBusy}
              onClick={admin.backToList}
              className={adminButtonClasses("default", "md")}
            >
              Cancel
            </button>
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
    </section>
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
