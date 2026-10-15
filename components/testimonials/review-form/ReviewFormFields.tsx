"use client";

import { useId } from "react";
import { LocationSearch } from "./LocationSearch";
import { ProfilePhotoField } from "./ProfilePhotoField";
import { StarPicker } from "./StarPicker";
import type { ReviewForm } from "./useReviewForm";

const INPUT_CLASS =
  "w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ReviewFormFields({ form }: { form: ReviewForm }) {
  const nameId = useId();
  const emailId = useId();
  const aboutId = useId();
  const starsId = useId();
  const reviewId = useId();
  const { values, set } = form;

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-4">
        <div className="flex items-start gap-4">
          <ProfilePhotoField
            folder={form.folders.profilePhoto}
            profilePhotoUrl={values.profilePhotoUrl}
            onUploaded={form.setProfilePhoto}
            onError={form.showError}
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <label htmlFor={nameId} className="text-sm font-medium">
                Name *
              </label>
              <input
                id={nameId}
                value={values.name}
                onChange={(event) => set.setName(event.target.value)}
                className={INPUT_CLASS}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={emailId} className="text-sm font-medium">
                Email *
              </label>
              <input
                id={emailId}
                value={values.email}
                onChange={(event) => set.setEmail(event.target.value)}
                className={INPUT_CLASS}
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={aboutId} className="text-sm font-medium">
            About you
          </label>
          <input
            id={aboutId}
            value={values.about}
            onChange={(event) => set.setAbout(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Bride, model, brand..."
          />
        </div>

        <LocationSearch
          selectedLocation={values.selectedLocation}
          onSelect={set.setSelectedLocation}
          onClear={() => set.setSelectedLocation(null)}
        />
      </div>

      <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-4">
        <div id={starsId} className="text-sm font-medium">
          Stars *
        </div>
        <div className="mt-3" role="group" aria-labelledby={starsId}>
          <StarPicker rating={values.rating} setRating={set.setRating} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={reviewId} className="text-sm font-medium">
          Review *
        </label>
        <textarea
          id={reviewId}
          value={values.review}
          onChange={(event) => set.setReview(event.target.value)}
          className="min-h-44 w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Write your review here..."
        />
      </div>
    </div>
  );
}
