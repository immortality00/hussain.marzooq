"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

type WidgetResult = { info?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function StarPicker({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setRating(value)}
          className={`text-3xl transition-transform hover:scale-110 ${
            value <= rating ? "text-amber-400" : "text-muted-foreground/30"
          }`}
          aria-label={`Set ${value} star rating`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function PublicReviewForm({ triggerOnly = false }: { triggerOnly?: boolean }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (open) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [open]);

  function resetForm() {
    setName("");
    setEmail("");
    setAbout("");
    setLocation("");
    setReview("");
    setRating(0);
    setProfilePhotoUrl("");
    setPhotoUrls([]);
    setSubmitting(false);
    setBanner(null);
  }

  function addPhoto(url: string) {
    setPhotoUrls((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url].slice(0, 12);
    });
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((item) => item !== url));
  }

  async function submit() {
    setBanner(null);

    if (!name.trim()) {
      setBanner({ type: "err", text: "Name is required." });
      return;
    }
    if (!email.trim()) {
      setBanner({ type: "err", text: "Email is required." });
      return;
    }
    if (!review.trim()) {
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
          name,
          email,
          about,
          location,
          review,
          rating,
          profilePhotoUrl,
          photoUrls,
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90 transition-opacity"
      >
        Leave a review
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-[2rem] bg-background shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/50 p-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Leave a review</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Name, email, stars, and review are required.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="text-sm font-medium">Profile photo</div>

                      <div className="mt-2">
                        <CldUploadWidget
                          signatureEndpoint="/api/sign-cloudinary-params"
                          options={{
                            folder: "hm_visuals/testimonials",
                            multiple: false,
                            resourceType: "image",
                            cropping: true,
                            croppingAspectRatio: 1,
                            showSkipCropButton: false,
                          }}
                          onSuccess={(result: unknown) => {
                            const info = (result as WidgetResult)?.info;
                            if (!isRecord(info)) return;
                            const secureUrl = getString(info.secure_url);
                            if (secureUrl) setProfilePhotoUrl(secureUrl);
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              Upload
                            </button>
                          )}
                        </CldUploadWidget>
                      </div>

                      <div className="relative mt-3 h-24 w-24 overflow-hidden rounded-full bg-muted/55">
                        {profilePhotoUrl ? (
                          <Image
                            src={profilePhotoUrl}
                            alt="Profile photo"
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name *</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">About you</label>
                      <input
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Bride, model, brand..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Dubai, UAE"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stars *</label>
                    <div className="rounded-xl border border-border/60 px-4 py-3">
                      <StarPicker rating={rating} setRating={setRating} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review *</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="min-h-40 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Write your review here..."
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photos</label>

                    <div className="flex flex-wrap gap-2">
                      <CldUploadWidget
                        signatureEndpoint="/api/sign-cloudinary-params"
                        options={{
                          folder: "hm_visuals/testimonials",
                          multiple: true,
                          maxFiles: 12,
                          resourceType: "image",
                        }}
                        onSuccess={(result: unknown) => {
                          const info = (result as WidgetResult)?.info;
                          if (!isRecord(info)) return;
                          const secureUrl = getString(info.secure_url);
                          if (secureUrl) addPhoto(secureUrl);
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="rounded-xl border border-border/60 px-4 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            Upload photos
                          </button>
                        )}
                      </CldUploadWidget>

                      {photoUrls.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPhotoUrls([])}
                          className="rounded-xl border border-border/60 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          Clear all
                        </button>
                      ) : null}
                    </div>

                    {photoUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photoUrls.map((url) => (
                          <div key={url} className="space-y-2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[0.95rem] bg-muted/50">
                              <Image
                                src={url}
                                alt="Review upload"
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(url)}
                              className="w-full rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:bg-accent"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

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

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void submit()}
                      className="rounded-xl bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90 disabled:opacity-60"
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