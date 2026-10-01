"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { adminInputClasses } from "@/components/admin/admin-input";
import { useSortableRow } from "@/components/admin/sortable/SortableList";
import type { BlogCategory } from "../lib/api";

export function BlogCategoryRow({
  cat,
  onSave,
  onToggle,
  onDelete,
}: {
  cat: BlogCategory;
  onSave: (next: { name: string; slug: string }) => void;
  onToggle: (value: boolean) => void;
  onDelete: () => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(cat.id);
  const [name, setName] = useState(cat.name);
  const [slug, setSlug] = useState(cat.slug);
  const dirty = name !== cat.name || slug !== cat.slug;

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-3 rounded-2xl border p-3">
      <button
        type="button"
        {...handleProps}
        aria-label="Drag to reorder"
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="size-4" />
      </button>

      <input value={name} onChange={(e) => setName(e.target.value)} className={adminInputClasses("md", "w-auto min-w-40 flex-1")} />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} className={adminInputClasses("md", "w-auto min-w-40 flex-1 font-mono md:text-xs")} />

      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{cat.postsCount}</span>

      <AdminToggle checked={cat.isActive} onChange={onToggle} label={`Toggle ${cat.name}`} />

      {dirty ? (
        <AdminButton variant="solid" size="sm" onClick={() => onSave({ name, slug })}>
          Save
        </AdminButton>
      ) : null}

      <AdminButton variant="danger" size="sm" onClick={onDelete}>
        Delete
      </AdminButton>
    </div>
  );
}
