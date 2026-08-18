"use client";

import { SortableList } from "@/components/admin/sortable/SortableList";
import type { Tag, TagPatch } from "../lib/types";
import TagRow from "./TagRow";

export default function TagsTable({
  ordered,
  onReorder,
  onEdit,
  onToggle,
  onDelete,
}: {
  ordered: Tag[];
  onReorder: (activeId: string, overId: string) => void;
  onEdit: (id: string, patch: TagPatch) => void;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (tag: Tag) => void;
}) {
  if (!ordered.length) {
    return (
      <div className="mt-8 rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        No tags yet. Add one above.
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      <SortableList ids={ordered.map((t) => t.id)} onReorder={onReorder}>
        {ordered.map((t) => (
          <TagRow key={t.id} tag={t} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </SortableList>
    </div>
  );
}
