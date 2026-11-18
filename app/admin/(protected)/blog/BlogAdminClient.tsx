"use client";

import type { MouseEvent } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { FilterPills } from "@/components/admin/FilterPills";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAddressValues } from "@/hooks/useAddressValues";
import { useListReturn } from "@/hooks/useListReturn";
import { leaveList, rowElement } from "@/lib/client/list-return";
import { useBulkRunner } from "@/components/admin/bulk/useBulkRunner";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { BlogPostRow } from "./components/BlogPostRow";
import { deletePost, updatePost } from "./lib/api";
import { withSavedPost, withoutPost } from "./lib/blog-store";
import { BLOG_LIST, BLOG_LIST_PARAMS, STATUS_FILTERS, statusFilterOf, statusOf } from "./lib/post-status";
import type { BlogListItem } from "./lib/types";

export default function BlogAdminClient() {
  const [blog, setBlog] = useAdminSlice("blog");
  const [address, setAddress] = useAddressValues(BLOG_LIST_PARAMS);
  const status = statusFilterOf(address.status);
  const items = blog.posts;
  const shown = status ? items.filter((post) => statusOf(post) === status) : items;
  const { feedback, setFeedback, run: runAction } = useAdminAction();
  const labelOf = (id: string) => items.find((p) => p.id === id)?.title || "Untitled";
  const { selection, busy: bulkBusy, run } = useBulkRunner(shown.map((p) => p.id), labelOf, setFeedback);
  useListReturn(BLOG_LIST, status, true);

  function openPost(id: string, event: MouseEvent<HTMLAnchorElement>) {
    leaveList(BLOG_LIST, status, id, rowElement(event.currentTarget));
  }

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
        <FilterPills
          label="Post status"
          options={STATUS_FILTERS}
          value={status}
          onChange={(value) => setAddress({ status: value })}
        />
      ) : null}

      {shown.length > 0 ? (
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
            {shown.map((post) => (
              <BlogPostRow
                key={post.id}
                post={post}
                selected={selection.isSelected(post.id)}
                onToggle={() => selection.toggle(post.id)}
                onOpen={openPost}
                onDismiss={dismiss}
              />
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
          {items.length > 0 ? "No posts with this status." : "No posts yet. Create your first one."}
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
