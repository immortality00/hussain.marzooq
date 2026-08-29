"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { fetchPosts, deletePost, updatePost } from "./lib/api";
import type { BlogListItem } from "./lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export default function BlogAdminClient({ initial }: { initial: BlogListItem[] }) {
  const [items, setItems] = useState<BlogListItem[]>(initial);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { feedback, setFeedback, notify } = useAdminAction();

  const selection = useBulkSelection(items.map((p) => p.id));

  async function refresh() {
    try {
      setItems(await fetchPosts());
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Failed to load posts.");
    }
  }

  async function bulkPublish(value: boolean) {
    if (bulkBusy || selection.count === 0) return;
    setBulkBusy(true);
    setFeedback({ type: "info", text: value ? "Publishing…" : "Unpublishing…" });
    const { ok, failed } = await runBulkAction(selection.selectedIds, (id) =>
      updatePost(id, { isPublished: value }),
    );
    setFeedback({
      type: failed ? "err" : "ok",
      text: `${ok} ${value ? "published" : "unpublished"}${failed ? `, ${failed} failed` : ""}.`,
    });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  async function bulkDelete() {
    if (bulkBusy || selection.count === 0) return;
    if (!confirm(`Delete ${selection.count} post(s)? This cannot be undone.`)) return;
    setBulkBusy(true);
    setFeedback({ type: "info", text: "Deleting…" });
    const { ok, failed } = await runBulkAction(selection.selectedIds, (id) => deletePost(id));
    setFeedback({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} failed` : ""}.` });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Blog"
        description={`${items.length} post${items.length === 1 ? "" : "s"}`}
        actions={
          <AdminButton href="/admin/blog/new" variant="solid">
            New post
          </AdminButton>
        }
      />

      <AdminActionFeedback feedback={feedback} className="" />

      {items.length > 0 ? (
        <>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <BulkCheckbox
              checked={selection.allSelected}
              indeterminate={selection.count > 0 && !selection.allSelected}
              onChange={selection.toggleAll}
              label="Select all posts"
            />
            Select all
          </div>

          <ul className="divide-y rounded-2xl border">
            {items.map((post) => (
              <li key={post.id} className="flex items-center gap-3 px-4 py-3">
                <BulkCheckbox
                  checked={selection.isSelected(post.id)}
                  onChange={() => selection.toggle(post.id)}
                  label={`Select ${post.title}`}
                />

                <Link href={`/admin/blog/${post.id}`} className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{post.title || "Untitled"}</div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    /{post.slug}
                    {post.categoryLabel ? ` · ${post.categoryLabel}` : ""}
                    {` · ${formatDate(post.updatedAt)}`}
                  </div>
                </Link>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${
                    post.isPublished
                      ? "border-green-500/30 bg-green-500/10 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {post.isPublished ? "Published" : "Draft"}
                </span>

                <AdminButton href={`/admin/blog/${post.id}`} variant="default" size="sm">
                  Edit
                </AdminButton>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
          No posts yet. Create your first one.
        </div>
      )}

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Publish", onRun: () => bulkPublish(true) },
          { label: "Unpublish", onRun: () => bulkPublish(false) },
          { label: "Delete", tone: "danger", onRun: bulkDelete },
        ]}
      />
    </div>
  );
}
