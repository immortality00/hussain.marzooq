"use client";

import { useEffect, useMemo, useState } from "react";
import MediaCardGrid from "./MediaCardGrid";
import MediaFilterBar from "./MediaFilterBar";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem } from "./types";

export function MediaGrid({
  items,
  mediaMode = "image",
}: {
  items: MediaItem[];
  mediaMode?: "image" | "video";
}) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [active, setActive] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (active) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [active]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      for (const t of it.tags) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return items.filter((m) => {
      const text =
        `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${m.event ?? ""} ${(m.tags ?? []).join(" ")} ${(m.people ?? []).join(" ")}`.toLowerCase();

      const matchesQuery = query ? text.includes(query) : true;
      const matchesTag = activeTag ? m.tags.includes(activeTag) : true;

      return matchesQuery && matchesTag;
    });
  }, [items, q, activeTag]);

  return (
    <div id={mediaMode === "video" ? "videos" : undefined} className="mt-10 space-y-6 scroll-mt-24">
      <MediaFilterBar
        q={q}
        setQ={setQ}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        allTags={allTags}
      />

      <MediaCardGrid items={filtered} onSelect={setActive} mediaMode={mediaMode} />

      {active ? <MediaLightbox active={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}