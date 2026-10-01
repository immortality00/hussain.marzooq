"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { ADMIN_REQUEST_LIMIT, runAllLimited } from "@/lib/settle-limited";

type Ordered = { id: string; order: number };

export function useDraftOrder<T extends Ordered>(items: T[], setItems: (update: (previous: T[]) => T[]) => void) {
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

  async function save(patchOrder: (id: string, order: number) => Promise<unknown>) {
    const saved = new Map(items.map((item) => [item.id, item.order]));
    const position = new Map(ordered.map((item, index) => [item.id, index]));
    const changes = ordered.filter((item, index) => saved.get(item.id) !== index);
    await runAllLimited(changes, ADMIN_REQUEST_LIMIT, (item) => patchOrder(item.id, position.get(item.id)!));
    setItems((previous) =>
      previous.map((item) => (position.has(item.id) ? { ...item, order: position.get(item.id)! } : item))
    );
    setDraft(null);
  }

  return { ordered, move, save };
}
