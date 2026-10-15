"use client";

import { useCallback, useState } from "react";
import type { FormStatusState } from "@/components/shared/FormStatus";
import { tokenWaitMs } from "@/hooks/useFormToken";
import { discardUpload } from "./discardUpload";
import type { LocationOption } from "./types";
import { useReviewUploadSession } from "./useReviewUploadSession";
import { MAX_REVIEW_PHOTOS } from "./utils";
import { reviewFormError } from "./validate";

export type ReviewForm = ReturnType<typeof useReviewForm>;

export function useReviewForm(open: boolean, setOpen: (open: boolean) => void) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hasPendingUploads, setHasPendingUploads] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<FormStatusState>(null);

  const showError = useCallback((text: string) => setBanner({ type: "err", text }), []);
  const hasUploadedFiles = Boolean(profilePhotoUrl || photoUrls.length > 0 || hasPendingUploads);
  const session = useReviewUploadSession(open, hasUploadedFiles, showError);

  function resetForm() {
    setName("");
    setEmail("");
    setAbout("");
    setSelectedLocation(null);
    setReview("");
    setRating(0);
    setProfilePhotoUrl("");
    setPhotoUrls([]);
    setHasPendingUploads(false);
    setConsent(false);
    setWebsite("");
    setSubmitting(false);
    setBanner(null);
    session.reset();
  }

  async function close() {
    await session.cleanup();
    resetForm();
    setOpen(false);
  }

  function setProfilePhoto(url: string) {
    if (profilePhotoUrl && profilePhotoUrl !== url) discardUpload(profilePhotoUrl);
    setProfilePhotoUrl(url);
    setHasPendingUploads(true);
  }

  function addPhoto(url: string) {
    setPhotoUrls((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url].slice(0, MAX_REVIEW_PHOTOS);
    });
    setHasPendingUploads(true);
  }

  function removePhoto(url: string) {
    discardUpload(url);
    setPhotoUrls((prev) => prev.filter((item) => item !== url));
  }

  function clearPhotos() {
    photoUrls.forEach(discardUpload);
    setPhotoUrls([]);
  }

  async function submit() {
    setBanner(null);

    const error = reviewFormError({ name, email, review, rating, consent });
    if (error) {
      setBanner({ type: "err", text: error });
      return;
    }

    setSubmitting(true);

    const { formToken } = session;
    const wait = formToken ? tokenWaitMs(formToken.receivedAt) : 0;
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          about,
          locationId: selectedLocation?.id ?? null,
          locationLabel: selectedLocation?.label ?? null,
          review: review.trim(),
          rating,
          profilePhotoUrl,
          photoUrls,
          consent,
          website,
          formToken: formToken?.token ?? null,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };

      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Submission failed." });
        setSubmitting(false);
        return;
      }

      session.markCommitted();

      setBanner({
        type: "ok",
        text: "Thank you. Your review was submitted and is waiting for approval.",
      });

      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, 1200);
    } catch {
      setBanner({ type: "err", text: "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  }

  return {
    values: { name, email, about, selectedLocation, review, rating, profilePhotoUrl, photoUrls, consent, website },
    set: { setName, setEmail, setAbout, setSelectedLocation, setReview, setRating, setConsent, setWebsite },
    folders: session.folders,
    banner,
    submitting,
    showError,
    setProfilePhoto,
    addPhoto,
    removePhoto,
    clearPhotos,
    close,
    submit,
  };
}
