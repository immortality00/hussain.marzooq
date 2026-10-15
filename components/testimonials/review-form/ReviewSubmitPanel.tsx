"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { FormStatus } from "@/components/shared/FormStatus";
import { ReviewPhotosField } from "./ReviewPhotosField";
import type { ReviewForm } from "./useReviewForm";

export function ReviewSubmitPanel({ form }: { form: ReviewForm }) {
  const { values, set } = form;

  return (
    <div className="space-y-5">
      <ReviewPhotosField
        folder={form.folders.photos}
        photoUrls={values.photoUrls}
        onUploaded={form.addPhoto}
        onClear={form.clearPhotos}
        onRemove={form.removePhoto}
        onError={form.showError}
      />

      <FormStatus status={form.banner} />

      <div className="space-y-4 rounded-[2rem] border border-border/60 bg-muted/20 p-4">
        <label
          htmlFor="review-consent"
          className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
        >
          <input
            id="review-consent"
            type="checkbox"
            checked={values.consent}
            onChange={(event) => set.setConsent(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-foreground"
          />
          <span>
            I agree to my name, review, photos and location being published on this
            site. See the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="underline underline-offset-4 hover:text-foreground"
            >
              privacy page
            </Link>
            .
          </span>
        </label>

        <Button
          variant="solid"
          disabled={form.submitting || !values.consent}
          onClick={() => void form.submit()}
          className="w-full justify-center disabled:opacity-60"
        >
          {form.submitting ? "Submitting..." : "Submit review"}
        </Button>
      </div>
    </div>
  );
}
