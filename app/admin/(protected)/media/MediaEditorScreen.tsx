"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import MediaEditorClient from "./MediaEditorClient";
import { MediaOptionsProvider } from "./components/MediaOptionsContext";
import { fetchMediaItem } from "./lib/editor-actions";
import { foundMedia } from "./lib/found-media";
import type { MediaItem } from "./lib/types";

type Fetched = { id: string; item: MediaItem | null; error: string | null };

export function MediaEditorScreen() {
  const editId = (useSearchParams().get("edit") ?? "").trim();
  const [media] = useAdminSlice("media");
  const stored = editId ? ((media.full[editId] ?? foundMedia(editId)) as MediaItem | null) : null;
  const [fetched, setFetched] = useState<Fetched | null>(null);

  useEffect(() => {
    if (!editId || stored) return;
    let cancelled = false;
    fetchMediaItem(editId).then(
      (item) => !cancelled && setFetched({ id: editId, item, error: null }),
      (error: unknown) => !cancelled && setFetched({ id: editId, item: null, error: errorMessage(error, "Not found") })
    );
    return () => {
      cancelled = true;
    };
  }, [editId, stored]);

  const lookup = fetched?.id === editId ? fetched : null;
  if (editId && !stored && !lookup) return <LoadingScreen className="min-h-[60dvh]" />;

  return (
    <MediaOptionsProvider>
      <MediaEditorClient
        key={editId || "new"}
        initialItem={stored ?? lookup?.item ?? null}
        loadError={lookup?.error ?? null}
      />
    </MediaOptionsProvider>
  );
}
