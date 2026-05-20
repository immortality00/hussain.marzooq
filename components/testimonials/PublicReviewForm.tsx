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
  const [about, setAbout] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (open) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [open]);

  function resetForm() {
    setName("");
    setAbout("");
    setReview("");
    setRating(5);
    setPhotoUrls([]);
    setSubmitting(false);
    setBanner(null);
  }

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
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

    if (!review.trim()) {
      setBanner({ type: "err", text: "Review is required." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, about, review, rating, photoUrls }),
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
        closeModal();
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
        onClick={openModal}
        className="inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90 transition-opacity"
      >
        Leave a review
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={closeModal}>
          <div
            className="mx-auto mt-6 w-full max-w-4xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Leave a review</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Name, stars, and review are required. Everything else is optional.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stars *</label>
                    <div className="rounded-xl border px-4 py-3">
                      <StarPicker rating={rating} setRating={setRating} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">About you</label>
                    <input
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Bride, model, brand, artist, organizer..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review *</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="min-h-40 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            Upload photos
                          </button>
                        )}
                      </CldUploadWidget>

                      {photoUrls.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPhotoUrls([])}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          Clear all
                        </button>
                      ) : null}
                    </div>

                    {photoUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photoUrls.map((url) => (
                          <div key={url} className="space-y-2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                              <Image src={url} alt="Review upload" fill className="object-contain" sizes="220px" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(url)}
                              className="w-full rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                        Optional
                      </div>
                    )}
                  </div>

                  {banner ? (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        banner.type === "ok" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
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