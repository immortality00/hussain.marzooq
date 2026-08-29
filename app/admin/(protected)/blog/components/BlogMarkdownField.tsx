"use client";

import { useState } from "react";
import { BlogContent } from "@/components/blog/BlogContent";

export function BlogMarkdownField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Content (Markdown)</div>
        <div className="flex gap-1 rounded-lg border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`rounded-md px-2.5 py-1 ${!preview ? "bg-accent" : "text-muted-foreground"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`rounded-md px-2.5 py-1 ${preview ? "bg-accent" : "text-muted-foreground"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {preview ? (
        <div className="min-h-64 rounded-xl border p-5">
          {value.trim() ? (
            <BlogContent content={value} />
          ) : (
            <div className="text-sm text-muted-foreground">Nothing to preview.</div>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          placeholder="Write your post in Markdown…"
          className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
    </div>
  );
}
