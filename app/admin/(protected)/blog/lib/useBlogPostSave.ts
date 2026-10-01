"use client";

import { useState } from "react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useRecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { saveGuarded } from "@/lib/record-changed";
import { createPost, deletePost, updatePost, type SavedPost } from "./api";
import { withSavedPost, withoutPost } from "./blog-store";
import type { BlogPostFormValues } from "./types";

export function useBlogPostSave(id: string | undefined, version: string | null, load: (values: BlogPostFormValues) => void) {
  const { navigate, navigationCover } = useAdminNavigate();
  const [, setBlog] = useAdminSlice("blog");
  const [saving, setSaving] = useState(false);
  const [openedVersion, setOpenedVersion] = useState(version);
  const { feedback, notify, setFeedback } = useAdminAction();
  const changed = useRecordChangedDialog(() => setFeedback(null));

  function keep(saved: SavedPost) {
    setBlog((blog) => withSavedPost(blog, saved));
    setOpenedVersion(saved.item.updatedAt);
  }

  async function update(postId: string, values: BlogPostFormValues) {
    const saved = await saveGuarded(
      openedVersion,
      (expected) => updatePost(postId, values, expected),
      changed.ask,
      (current: SavedPost) => current.item.updatedAt,
      (current: SavedPost) => {
        keep(current);
        load(current.form);
      }
    );
    if (!saved) return setFeedback(null);
    keep(saved);
    notify("ok", "Post saved.");
  }

  async function save(values: BlogPostFormValues) {
    if (saving) return;
    if (!values.title.trim()) return notify("err", "Title is required.");
    setSaving(true);
    setFeedback({ type: "info", text: "Saving…" });
    try {
      if (id) return await update(id, values);
      const saved = await createPost(values);
      setBlog((blog) => withSavedPost(blog, saved));
      navigate("/admin/blog");
    } catch (e) {
      notify("err", errorMessage(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!id || saving) return;
    if (!confirm("Delete this post forever? This cannot be undone.")) return;
    setSaving(true);
    setFeedback({ type: "info", text: "Deleting…" });
    try {
      await deletePost(id);
      setBlog((blog) => withoutPost(blog, id));
      navigate("/admin/blog");
    } catch (e) {
      notify("err", errorMessage(e, "Delete failed."));
      setSaving(false);
    }
  }

  return { saving, feedback, save, remove, navigationCover, changedDialog: changed.dialog };
}
