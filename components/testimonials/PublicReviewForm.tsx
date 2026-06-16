"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";
import { LocationSearch } from "./review-form/LocationSearch";
import { ProfilePhotoField } from "./review-form/ProfilePhotoField";
import { ReviewPhotosField } from "./review-form/ReviewPhotosField";
import { StarPicker } from "./review-form/StarPicker";
import type { BannerState, LocationOption } from "./review-form/types";
import { createUploadSessionId, isValidEmail } from "./review-form/utils";
import { useModalVisibilityEvents } from "./review-form/useModalVisibilityEvents";

export default function PublicReviewForm({ triggerOnly = false }: { triggerOnly?: boolean }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hasPendingUploads, setHasPendingUploads] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<BannerState>(null);
  const [formStartedAt, setFormStartedAt] = useState(Date.now());
  const [uploadSessionId, setUploadSessionId] = useState(createUploadSessionId());
  const uploadSessionIdRef = useRef(uploadSessionId);

  useModalVisibilityEvents(open);

  const selectedLocationPayload = useMemo(
    () =>
      selectedLocation
        ? {
            locationId: selectedLocation.id,
            locationLabel: selectedLocation.label,
          }
        : {
            locationId: null,
            locationLabel: null,
          },
    [selectedLocation]
  );

  const profilePhotoFolder = useMemo(
    () => `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}/pfp`,
    [uploadSessionId]
  );

  const photosFolder = useMemo(
    () => `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}/photos`,
    [uploadSessionId]
  );

  useEffect(() => {
    uploadSessionIdRef.current = uploadSessionId;
  }, [uploadSessionId]);

  const hasUploadedFiles = Boolean(profilePhotoUrl || photoUrls.length > 0 || hasPendingUploads);

  async function cleanupUploadSession(sessionId: string) {
    if (!sessionId || !hasUploadedFiles) return;

    try {
      await fetch("/api/testimonials/upload-session/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadSessionId: sessionId }),
      });
    } catch {
      // Best-effort cleanup only.
    }
  }

  async function handleClose() {
    await cleanupUploadSession(uploadSessionIdRef.current);
    resetForm();
    setOpen(false);
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasUploadedFiles) return;

      try {
        const payload = JSON.stringify({ uploadSessionId: uploadSessionIdRef.current });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/testimonials/upload-session/cleanup", blob);
      } catch {
        // Best-effort cleanup only.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUploadedFiles]);

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
    setWebsite("");
    setSubmitting(false);
    setBanner(null);
    setFormStartedAt(Date.now());
    setUploadSessionId(createUploadSessionId());
  }

  function handleProfilePhotoUploaded(url: string) {
    setProfilePhotoUrl(url);
    setHasPendingUploads(true);
  }

  function addPhoto(url: string) {
    setPhotoUrls((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url].slice(0, 12);
    });
    setHasPendingUploads(true);
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((item) => item !== url));
  }

  async function submit() {
    setBanner(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedReview = review.trim();

    if (!trimmedName) {
      setBanner({ type: "err", text: "Name is required." });
      return;
    }

    if (!trimmedEmail) {
      setBanner({ type: "err", text: "Email is required." });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setBanner({ type: "err", text: "Use a valid email address." });
      return;
    }

    if (!trimmedReview) {
      setBanner({ type: "err", text: "Review is required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      setBanner({ type: "err", text: "Stars are required." });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          about,
          ...selectedLocationPayload,
          review: trimmedReview,
          rating,
          profilePhotoUrl,
          photoUrls,
          website,
          formStartedAt,
          uploadSessionId,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };

      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Submission failed." });
        setSubmitting(false);
        return;
      }

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

  const triggerClassName = triggerOnly
    ? "inline-flex w-full justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
    : "inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Leave a review
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => void handleClose()}
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

              <button
                type="button"
                onClick={() => void handleClose()}
                className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="sr-only"
                name="website"
                aria-hidden="true"
              />

              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-start gap-4">
                      <ProfilePhotoField
                        folder={profilePhotoFolder}
                        profilePhotoUrl={profilePhotoUrl}
                        onUploaded={handleProfilePhotoUploaded}
                      />

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name *</label>
                          <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Your name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email *</label>
                          <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">About you</label>
                      <input
                        value={about}
                        onChange={(event) => setAbout(event.target.value)}
                        className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Bride, model, brand..."
                      />
                    </div>

                    <LocationSearch
                      selectedLocation={selectedLocation}
                      onSelect={setSelectedLocation}
                      onClear={() => setSelectedLocation(null)}
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
                    <label className="text-sm font-medium">Stars *</label>
                    <div className="mt-3">
                      <StarPicker rating={rating} setRating={setRating} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review *</label>
                    <textarea
                      value={review}
                      onChange={(event) => setReview(event.target.value)}
                      className="min-h-44 w-full rounded-[1.25rem] border border-border/70 bg-background px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Write your review here..."
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <ReviewPhotosField
                    folder={photosFolder}
                    photoUrls={photoUrls}
                    onUploaded={addPhoto}
                    onClear={() => setPhotoUrls([])}
                    onRemove={removePhoto}
                  />

                  {banner ? (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ring-1 ${
                        banner.type === "ok"
                          ? "bg-green-500/10 text-foreground ring-green-500/20"
                          : "bg-red-500/10 text-foreground ring-red-500/20"
                      }`}
                    >
                      {banner.text}
                    </div>
                  ) : null}

                  <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void submit()}
                      className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit review"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}