"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { useAddressValues } from "@/hooks/useAddressValues";
import { returnToRow } from "@/lib/client/list-return";
import MediaEditorClient from "./MediaEditorClient";
import { MediaOptionsProvider } from "./components/MediaOptionsContext";
import { DETAILS_STEP } from "./components/MediaWizard";
import { fetchMediaItem } from "./lib/editor-actions";
import { keptFullItem } from "./lib/media-page-sets";
import { MEDIA_EDITOR_PARAMS, MEDIA_LIST } from "./lib/media-list-address";
import type { MediaItem } from "./lib/types";

type Opened = { item: MediaItem | null; error: string | null };

const NEW_UPLOAD: Opened = { item: null, error: null };

// The item to edit: from the admin data or the list's kept rows when the phone has it, else fetched once.
function useOpenedItem(editId: string): Opened | null {
  const [media] = useAdminSlice("media");
  const stored = editId ? ((media.full[editId] ?? keptFullItem(editId)) as MediaItem | null) : null;
  const [fetched, setFetched] = useState<(Opened & { id: string }) | null>(null);

  useEffect(() => {
    if (!editId || stored || fetched?.id === editId) return;
    let cancelled = false;
    fetchMediaItem(editId).then(
      (item) => !cancelled && setFetched({ id: editId, item, error: null }),
      (error: unknown) => !cancelled && setFetched({ id: editId, item: null, error: errorMessage(error, "Not found") })
    );
    return () => {
      cancelled = true;
    };
  }, [editId, stored, fetched]);

  if (!editId) return NEW_UPLOAD;
  if (stored) return { item: stored, error: null };
  return fetched?.id === editId ? fetched : null;
}

// The media editor's screen. The item is `?edit=` in the address; Previous / Next item switch it here at once
// (the address follows), keeping the wizard on the same step, so walking through items to fix one field needs
// no list.
export function MediaEditorScreen() {
  const [address, setAddress] = useAddressValues(MEDIA_EDITOR_PARAMS);
  const editId = address.edit.trim();
  const opened = useOpenedItem(editId);

  const editing = Boolean(editId);
  const [step, setStep] = useState(editing ? DETAILS_STEP : 0);
  const [stepFor, setStepFor] = useState(editing);
  if (editing !== stepFor) {
    setStepFor(editing);
    setStep(editing ? DETAILS_STEP : 0);
  }

  const openItem = useCallback(
    (id: string) => {
      returnToRow(MEDIA_LIST, id);
      window.scrollTo(0, 0);
      setAddress({ edit: id });
    },
    [setAddress]
  );

  if (!opened) return <LoadingScreen className="min-h-[60dvh]" />;

  return (
    <MediaOptionsProvider>
      <MediaEditorClient
        key={editId}
        initialItem={opened.item}
        loadError={opened.error}
        step={step}
        onStep={setStep}
        openItem={openItem}
      />
    </MediaOptionsProvider>
  );
}
