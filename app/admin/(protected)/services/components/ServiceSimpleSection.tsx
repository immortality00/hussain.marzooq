"use client";

import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { Service } from "../lib/types";

export default function ServiceSimpleSection({
  title,
  description,
  services,
  busy,
  primaryActionLabel,
  onPrimaryAction,
  onEdit,
  onSecondaryAction,
  secondaryActionLabel = "Delete",
  secondaryDanger = false,
  disableSecondaryWhen,
  isSelected,
  onToggleSelect,
  selectAll,
}: {
  title: string;
  description?: string;
  services: Service[];
  busy: boolean;
  primaryActionLabel: string;
  onPrimaryAction: (service: Service) => void | Promise<void>;
  onEdit: (service: Service) => void;
  onSecondaryAction: (service: Service) => void | Promise<void>;
  secondaryActionLabel?: string;
  secondaryDanger?: boolean;
  disableSecondaryWhen?: (service: Service) => boolean;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  selectAll: { checked: boolean; indeterminate: boolean; onChange: () => void };
}) {
  if (!services.length) return null;

  return (
    <>
      <h2 className="mt-10 text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}

      <div className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground">
        <BulkCheckbox
          checked={selectAll.checked}
          indeterminate={selectAll.indeterminate}
          onChange={selectAll.onChange}
          label={`Select all ${title.toLowerCase()} services`}
        />
        Select all
      </div>

      <div className="mt-3 space-y-3">
        {services.map((s) => {
          const secondaryDisabled = disableSecondaryWhen ? disableSecondaryWhen(s) : false;

          return (
            <div key={s.id} className="rounded-2xl border p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <BulkCheckbox
                  checked={isSelected(s.id)}
                  onChange={() => onToggleSelect(s.id)}
                  label={`Select ${s.name}`}
                />
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">/{s.slug}</div>
                </div>
              </div>

              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <button
                  className={adminButtonClasses("default", "md")}
                  onClick={() => onEdit(s)}
                >
                  Edit
                </button>

                <button
                  className={adminButtonClasses("default", "md")}
                  onClick={() => void onPrimaryAction(s)}
                  disabled={busy}
                >
                  {primaryActionLabel}
                </button>

                <button
                  className={adminButtonClasses(secondaryDanger ? "danger" : "default", "md")}
                  onClick={() => void onSecondaryAction(s)}
                  disabled={busy || secondaryDisabled}
                  title={secondaryDisabled ? "Has inquiries" : secondaryActionLabel}
                >
                  {secondaryActionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}