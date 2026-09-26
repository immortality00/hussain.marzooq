"use client";

import { AdminButton } from "@/components/admin/AdminButton";
import { ModalPortal } from "@/components/shared/ModalPortal";
import type { MediaUsageDialogState } from "./useMediaUsageDialog";

export function MediaUsageDialog({ dialog }: { dialog: MediaUsageDialogState | null }) {
  if (!dialog) return null;

  const { items, options, answer } = dialog;
  const heading = items.length === 1 ? "This photo is used in:" : "These photos are used in:";

  return (
    <ModalPortal
      onClose={() => answer("cancel")}
      label={heading}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-background p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold">{heading}</p>
        <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.usedOn.join(" · ")}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <AdminButton onClick={() => answer("cancel")}>Cancel</AdminButton>
          {options.map((option) => (
            <AdminButton
              key={option.answer}
              variant={option.variant ?? "default"}
              onClick={() => answer(option.answer)}
            >
              {option.label}
            </AdminButton>
          ))}
        </div>
      </div>
    </ModalPortal>
  );
}
