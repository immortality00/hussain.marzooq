"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import type { Uploaded, WidgetResult } from "../lib/types";
import { getString, isRecord } from "../lib/utils";

export default function MediaAssetSection({
  mode,
  setMode,
  uploaded,
  setUploaded,
  embedUrl,
  setEmbedUrl,
}: {
  mode: "upload" | "embed";
  setMode: (value: "upload" | "embed") => void;
  uploaded: Uploaded | null;
  setUploaded: (value: Uploaded | null) => void;
  embedUrl: string;
  setEmbedUrl: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-xl border px-4 py-2 text-sm ${mode === "upload" ? "bg-accent" : "hover:bg-accent"}`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode("embed")}
          className={`rounded-xl border px-4 py-2 text-sm ${mode === "embed" ? "bg-accent" : "hover:bg-accent"}`}
        >
          Embed URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary-params"
              options={{ folder: "hm_visuals/media", multiple: false, resourceType: "auto" }}
              onSuccess={(result: unknown) => {
                const r = result as WidgetResult;
                const info = r?.info;
                if (!isRecord(info)) return;

                const secureUrl = getString(info.secure_url);
                const publicId = getString(info.public_id);
                const resourceType = getString(info.resource_type);

                if (!secureUrl || !publicId || !resourceType) return;
                setUploaded({ secureUrl, publicId, resourceType });
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                >
                  Choose file
                </button>
              )}
            </CldUploadWidget>

            <button
              type="button"
              onClick={() => setUploaded(null)}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
            >
              Clear
            </button>
          </div>

          {uploaded ? (
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-muted-foreground">
                {uploaded.resourceType === "video" ? "Video uploaded" : "Image uploaded"}
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border bg-muted">
                {uploaded.resourceType === "video" ? (
                  <video className="h-full w-full" controls preload="metadata" src={uploaded.secureUrl} />
                ) : (
                  <div className="relative aspect-video">
                    <Image
                      src={uploaded.secureUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 900px"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs font-mono text-muted-foreground break-all">
                {uploaded.publicId}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
              No file selected yet.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Embed URL</label>
          <input
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          />
        </div>
      )}
    </section>
  );
}