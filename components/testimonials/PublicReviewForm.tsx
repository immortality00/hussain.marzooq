"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { ModalPortal } from "@/components/shared/ModalPortal";
import { ReviewFormFields } from "./review-form/ReviewFormFields";
import { ReviewSubmitPanel } from "./review-form/ReviewSubmitPanel";
import { useModalVisibilityEvents } from "./review-form/useModalVisibilityEvents";
import { useReviewForm } from "./review-form/useReviewForm";

export default function PublicReviewForm() {
  const [open, setOpen] = useState(false);
  const form = useReviewForm(open, setOpen);

  useModalVisibilityEvents(open);

  return (
    <>
      <Button
        variant="solid"
        onClick={() => setOpen(true)}
        className="w-full justify-center"
      >
        Leave a review
      </Button>

      {open ? (
        <ModalPortal
          onClose={() => void form.close()}
          label="Leave a review"
          closeOnEscape={false}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-background text-foreground shadow-2xl ring-1 ring-border/70"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 bg-background p-5 sm:p-6">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.055em]">Leave a review</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Share your experience. Your review appears publicly only after approval.
                </p>
              </div>

              <Button onClick={() => void form.close()}>Close</Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6" data-lenis-prevent>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.values.website}
                onChange={(event) => form.set.setWebsite(event.target.value)}
                className="sr-only"
                name="website"
                aria-hidden="true"
              />

              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <ReviewFormFields form={form} />
                <ReviewSubmitPanel form={form} />
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </>
  );
}
