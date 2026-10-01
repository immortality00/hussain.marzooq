"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import MediaEditorClient from "./MediaEditorClient";
import { MediaOptionsProvider } from "./components/MediaOptionsContext";
import { fetchMediaItem } from "./lib/editor-actions";
import type { MediaItem } from "./lib/types";

type Opened = { item: MediaItem | null; error: string | null };

export function MediaEditorScreen() {
  const editId = (useSearchParams().get("edit") ?? "").trim();
  const [media] = useAdminSlice("media");
  const [opened, setOpened] = useState<Opened | null>(() => {
    if (!editId) return { item: null, error: null };
    const stored = media.full[editId] as MediaItem | undefined;
    return stored ? { item: stored, error: null } : null;
  });

  useEffect(() => {
    if (opened) return;
    let cancelled = false;
    fetchMediaItem(editId).then(
      (item) => !cancelled && setOpened({ item, error: null }),
      (error: unknown) => !cancelled && setOpened({ item: null, error: errorMessage(error, "Not found") })
    );
    return () => {
      cancelled = true;
    };
  }, [editId, opened]);

  if (!opened) return <LoadingScreen className="min-h-[60dvh]" />;

  return (
    <MediaOptionsProvider>
      <MediaEditorClient initialItem={opened.item} loadError={opened.error} />
    </MediaOptionsProvider>
  );
}
