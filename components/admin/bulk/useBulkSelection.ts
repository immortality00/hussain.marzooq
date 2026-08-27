"use client";

import { useCallback, useMemo, useState } from "react";

export function useBulkSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const idKey = allIds.join("|");
  const selectedIds = useMemo(
    () => allIds.filter((id) => selected.has(id)),
    // idKey stands in for allIds identity so the memo tracks membership changes
    // (e.g. rows removed after a delete) without depending on a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idKey, selected],
  );

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const count = selectedIds.length;
  const allSelected = allIds.length > 0 && count === allIds.length;

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const current = allIds.filter((id) => prev.has(id));
      return current.length === allIds.length ? new Set() : new Set(allIds);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  return { selectedIds, count, isSelected, toggle, toggleAll, clear, allSelected };
}

export async function runBulkAction(
  ids: string[],
  perItem: (id: string) => Promise<void>,
): Promise<{ ok: number; failed: number; okIds: string[]; failedIds: string[] }> {
  const results = await Promise.allSettled(ids.map((id) => perItem(id)));
  const okIds = ids.filter((_, i) => results[i]!.status === "fulfilled");
  const failedIds = ids.filter((_, i) => results[i]!.status === "rejected");
  return { ok: okIds.length, failed: failedIds.length, okIds, failedIds };
}
