"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

type Ordered = { id: string; order: number };

export function useDraftOrder<T extends Ordered>(items: T[]) {
  const [draft, setDraft] = useState<string[] | null>(null);

  const ordered = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    if (!draft) return sorted;
    const byId = new Map(sorted.map((item) => [item.id, item]));
    const kept = draft.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    const added = sorted.filter((item) => !draft.includes(item.id));
    return [...kept, ...added].map((item, order) => ({ ...item, order }));
  }, [items, draft]);

  function move(activeId: string, overId: string) {
    const ids = ordered.map((item) => item.id);
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0) return;
    setDraft(arrayMove(ids, from, to));
  }

  function withSavedOrder<U extends Ordered>(list: U[]): U[] {
    const position = new Map(ordered.map((item, index) => [item.id, index]));
    return list.map((item) => (position.has(item.id) ? { ...item, order: position.get(item.id)! } : item));
  }

  return { ordered, move, withSavedOrder, clearDraft: () => setDraft(null) };
}
