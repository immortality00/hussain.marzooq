"use client";

import { useState } from "react";
import { BlogContent } from "@/components/blog/BlogContent";
import { adminInputClasses } from "@/components/admin/admin-input";

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
          className={adminInputClasses("md", "font-mono leading-6")}
        />
      )}
    </div>
  );
}
