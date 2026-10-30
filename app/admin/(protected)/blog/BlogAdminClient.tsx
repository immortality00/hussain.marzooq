"use client";

import { useAdminSlice } from "@/hooks/useAdminData";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkRunner } from "@/components/admin/bulk/useBulkRunner";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { deletePost, updatePost } from "./lib/api";
import { withSavedPost, withoutPost } from "./lib/blog-store";
import type { BlogListItem } from "./lib/types";

const STATUS_CLASSES = {
  waiting: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  published: "border-green-500/30 bg-green-500/10 text-foreground",
  scheduled: "border-green-500/30 bg-green-500/10 text-foreground",
  draft: "text-muted-foreground",
} as const;

const STATUS_LABELS = { waiting: "Waiting", published: "Published", scheduled: "Scheduled", draft: "Draft" } as const;

function statusOf(post: BlogListItem): keyof typeof STATUS_LABELS {
  if (post.waiting) return "waiting";
  if (!post.isPublished) return "draft";
  // A draft made from a scheduled item goes out with it (U7).
  return post.publishedAt && new Date(post.publishedAt).getTime() > Date.now() ? "scheduled" : "published";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export default function BlogAdminClient() {
  const [blog, setBlog] = useAdminSlice("blog");
  const items = blog.posts;
  const { feedback, setFeedback, run: runAction } = useAdminAction();
  const labelOf = (id: string) => items.find((p) => p.id === id)?.title || "Untitled";
  const { selection, busy: bulkBusy, run } = useBulkRunner(items.map((p) => p.id), labelOf, setFeedback);

  const bulkPublish = (value: boolean) =>
    run(
      value ? "Publishing…" : "Unpublishing…",
      value ? "published" : "unpublished",
      async (id) => {
        const saved = await updatePost(id, { isPublished: value });
        setBlog((current) => withSavedPost(current, saved));
      },
      () => {}
    );

  async function dismiss(post: BlogListItem) {
    if (!confirm(`Dismiss “${post.title || "Untitled"}”? The draft is deleted.`)) return;
    await runAction(
      async () => {
        await deletePost(post.id);
        setBlog((current) => withoutPost(current, post.id));
      },
      { loadingText: "Dismissing…", successText: "Draft dismissed." }
    );
  }

  function bulkDelete() {
    if (!confirm(`Delete ${selection.count} post(s)? This cannot be undone.`)) return;
    return run("Deleting…", "deleted", deletePost, (okIds) =>
      setBlog((current) => okIds.reduce(withoutPost, current))
    );
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
              <li key={post.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <BulkCheckbox
                  checked={selection.isSelected(post.id)}
                  onChange={() => selection.toggle(post.id)}
                  label={`Select ${post.title}`}
                />

                <AdminLink href={`/admin/blog/edit?id=${post.id}`} className="min-w-0 flex-1 basis-32">
                  <div className="text-sm font-medium wrap-anywhere">{post.title || "Untitled"}</div>
                  <div className="mt-0.5 font-mono wrap-anywhere text-[11px] text-muted-foreground">
                    /{post.slug}
                    {post.categoryLabel ? ` · ${post.categoryLabel}` : ""}
                    {` · ${formatDate(post.updatedAt)}`}
                  </div>
                </AdminLink>

                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] ${STATUS_CLASSES[statusOf(post)]}`}>
                    {STATUS_LABELS[statusOf(post)]}
                  </span>

                  {post.waiting ? (
                    <AdminButton variant="danger" size="sm" onClick={() => dismiss(post)}>
                      Dismiss
                    </AdminButton>
                  ) : null}

                  <AdminButton href={`/admin/blog/edit?id=${post.id}`} variant="default" size="sm">
                    Edit
                  </AdminButton>
                </div>
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
