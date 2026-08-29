"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { CLOUDINARY_BLOG_FOLDER } from "@/lib/cloudinary-folders";
import { slugifyTag } from "@/lib/server/media-tags";
import { TagsInput } from "./TagsInput";
import { BlogMarkdownField } from "./BlogMarkdownField";
import { createPost, updatePost, deletePost } from "../lib/api";
import type { BlogCategoryOption, BlogPostFormValues } from "../lib/types";

const INPUT = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const EMPTY: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImagePublicId: "",
  categoryId: "",
  tags: [],
  author: "Hussain Marzooq",
  isPublished: false,
};

export function BlogPostEditor({
  id,
  initial,
  categories,
}: {
  id?: string;
  initial?: BlogPostFormValues;
  categories: BlogCategoryOption[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<BlogPostFormValues>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const { feedback, notify, setFeedback } = useAdminAction();

  const isEdit = Boolean(id);

  function set<K extends keyof BlogPostFormValues>(key: K, val: BlogPostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function onTitleChange(title: string) {
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugifyTag(title),
    }));
  }

  async function save() {
    if (saving) return;
    if (!values.title.trim()) {
      notify("err", "Title is required.");
      return;
    }
    setSaving(true);
    setFeedback({ type: "info", text: "Saving…" });
    try {
      if (isEdit && id) {
        await updatePost(id, values);
        notify("ok", "Post saved.");
        router.refresh();
      } else {
        await createPost(values);
        router.push("/admin/blog");
        router.refresh();
        return;
      }
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Save failed.");
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
      router.push("/admin/blog");
      router.refresh();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Delete failed.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit post" : "New post"}
        actions={
          <>
            <AdminButton href="/admin/blog" variant="ghost">
              Back
            </AdminButton>
            {isEdit ? (
              <AdminButton variant="danger" onClick={remove} disabled={saving}>
                Delete
              </AdminButton>
            ) : null}
            <AdminButton variant="solid" onClick={save} disabled={saving}>
              {isEdit ? "Save" : "Create post"}
            </AdminButton>
          </>
        }
      />

      <AdminActionFeedback feedback={feedback} className="" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Title</span>
            <input value={values.title} onChange={(e) => onTitleChange(e.target.value)} className={INPUT} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Slug</span>
            <input
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugifyTag(e.target.value));
              }}
              className={INPUT}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Excerpt</span>
            <textarea
              value={values.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className={INPUT}
            />
          </label>

          <BlogMarkdownField value={values.content} onChange={(v) => set("content", v)} />
        </div>

        <aside className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <div className="text-sm font-medium">Published</div>
              <div className="text-xs text-muted-foreground">
                {values.isPublished ? "Visible on the site" : "Draft"}
              </div>
            </div>
            <AdminToggle
              checked={values.isPublished}
              onChange={(v) => set("isPublished", v)}
              label="Toggle published"
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Category</span>
            <select
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={INPUT}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Cover image</span>
            <ImageField
              folder={CLOUDINARY_BLOG_FOLDER}
              value={{ url: values.coverImageUrl, publicId: values.coverImagePublicId }}
              onChange={(img) => {
                set("coverImageUrl", img.url);
                set("coverImagePublicId", img.publicId);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Tags</span>
            <TagsInput value={values.tags} onChange={(t) => set("tags", t)} />
          </div>
        </aside>
      </div>
    </div>
  );
}
