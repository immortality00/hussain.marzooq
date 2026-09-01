"use client";

"use client";

import { useState } from "react";
import Image from "next/image";
import type { Uploaded } from "../lib/types";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";

export default function MediaAssetSection({
  mode,
  setMode,
  uploaded,
  setUploaded,
  embedUrl,
  setEmbedUrl,
  allowEmbed = true,
  uploadFolder,
  canUpload = true,
}: {
  mode: "upload" | "embed";
  setMode: (value: "upload" | "embed") => void;
  uploaded: Uploaded | null;
  setUploaded: (value: Uploaded | null) => void;
  embedUrl: string;
  setEmbedUrl: (value: string) => void;
  allowEmbed?: boolean;
  uploadFolder: string;
  canUpload?: boolean;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <section className="rounded-3xl border p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={adminButtonClasses("default", "md", mode === "upload" ? "bg-accent" : "")}
        >
          Upload file
        </button>

        {allowEmbed ? (
          <button
            type="button"
            onClick={() => setMode("embed")}
            className={adminButtonClasses("default", "md", mode === "embed" ? "bg-accent" : "")}
          >
            Embed URL
          </button>
        ) : null}
      </div>

      {mode === "upload" ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CloudinaryUploadButton
              folder={uploadFolder}
              disabled={!canUpload}
              onUploaded={(u) => {
                setUploadError(null);
                setUploaded(u);
              }}
              onError={setUploadError}
            />

            <button
              type="button"
              onClick={() => setUploaded(null)}
              className={adminButtonClasses("default", "md")}
            >
              Clear
            </button>
          </div>

          {uploadError ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {uploadError}
            </div>
          ) : null}

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