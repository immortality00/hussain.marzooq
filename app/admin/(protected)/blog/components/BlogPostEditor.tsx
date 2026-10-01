"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { adminInputClasses } from "@/components/admin/admin-input";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { useBlogPostSave } from "../lib/useBlogPostSave";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { CLOUDINARY_BLOG_FOLDER } from "@/lib/cloudinary-folders";
import { slugifyTag } from "@/lib/server/media-tags";
import { TagsInput } from "./TagsInput";
import { BlogMarkdownField } from "./BlogMarkdownField";
import type { BlogCategoryOption, BlogPostFormValues } from "../lib/types";

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
  version = null,
  categories,
}: {
  id?: string;
  initial?: BlogPostFormValues;
  version?: string | null;
  categories: BlogCategoryOption[];
}) {
  const [values, setValues] = useState<BlogPostFormValues>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const { saving, feedback, save: saveValues, remove, navigationCover, changedDialog } = useBlogPostSave(
    id,
    version,
    setValues
  );
  const save = () => saveValues(values);

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

  return (
    <div className="space-y-6">
      {navigationCover}
      <RecordChangedDialog dialog={changedDialog} />
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
            <input value={values.title} onChange={(e) => onTitleChange(e.target.value)} className={adminInputClasses()} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Slug</span>
            <input
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugifyTag(e.target.value));
              }}
              className={adminInputClasses()}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Excerpt</span>
            <textarea
              value={values.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className={adminInputClasses()}
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
              className={adminInputClasses()}
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
