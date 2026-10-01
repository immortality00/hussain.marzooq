"use client";

import type { ReactNode } from "react";
import { AdminButton, type AdminButtonVariant } from "@/components/admin/AdminButton";
import { ModalPortal } from "@/components/shared/ModalPortal";

export type ChoiceOption<A extends string> = { answer: A; label: string; variant?: AdminButtonVariant };

export function ChoiceDialog<A extends string>({
  heading,
  options,
  onAnswer,
  cancel,
  children,
}: {
  heading: string;
  options: ChoiceOption<A>[];
  onAnswer: (answer: A) => void;
  cancel: A;
  children?: ReactNode;
}) {
  return (
    <ModalPortal
      onClose={() => onAnswer(cancel)}
      label={heading}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-background p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold">{heading}</p>
        {children}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <AdminButton onClick={() => onAnswer(cancel)}>Cancel</AdminButton>
          {options.map((option) => (
            <AdminButton
              key={option.answer}
              variant={option.variant ?? "default"}
              onClick={() => onAnswer(option.answer)}
            >
              {option.label}
            </AdminButton>
          ))}
        </div>
      </div>
    </ModalPortal>
  );
}
