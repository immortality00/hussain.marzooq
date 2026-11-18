"use client";

import type { MouseEvent } from "react";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminButton } from "@/components/admin/AdminButton";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { STATUS_CLASSES, STATUS_LABELS, statusOf } from "../lib/post-status";
import type { BlogListItem } from "../lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function BlogPostRow({
  post,
  selected,
  onToggle,
  onOpen,
  onDismiss,
}: {
  post: BlogListItem;
  selected: boolean;
  onToggle: () => void;
  onOpen: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  onDismiss: (post: BlogListItem) => void;
}) {
  const status = statusOf(post);
  const href = `/admin/blog/edit?id=${post.id}`;

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3" data-list-row={post.id}>
      <BulkCheckbox checked={selected} onChange={onToggle} label={`Select ${post.title}`} />

      <AdminLink href={href} onClick={(event) => onOpen(post.id, event)} className="min-w-0 flex-1 basis-32">
        <div className="text-sm font-medium wrap-anywhere">{post.title || "Untitled"}</div>
        <div className="mt-0.5 font-mono wrap-anywhere text-[11px] text-muted-foreground">
          /{post.slug}
          {post.categoryLabel ? ` · ${post.categoryLabel}` : ""}
          {` · ${formatDate(post.updatedAt)}`}
        </div>
      </AdminLink>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${STATUS_CLASSES[status]}`}>
          {STATUS_LABELS[status]}
        </span>

        {post.waiting ? (
          <AdminButton variant="danger" size="sm" onClick={() => onDismiss(post)}>
            Dismiss
          </AdminButton>
        ) : null}

        <AdminButton href={href} onClick={(event) => onOpen(post.id, event)} variant="default" size="sm">
          Edit
        </AdminButton>
      </div>
    </li>
  );
}
