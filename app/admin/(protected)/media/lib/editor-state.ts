import { useBaseMediaEditorState } from "./useBaseMediaEditorState";
import { useMediaAppearancesState } from "./useMediaAppearancesState";
import { useNftEditorState } from "./useNftEditorState";
import type { MediaCategory, MediaItem } from "./types";

export function useMediaEditorState() {
  const base = useBaseMediaEditorState();
  const nft = useNftEditorState();
  const appearanceState = useMediaAppearancesState();

  function resetFields(keepBanner: boolean, clearBanner?: () => void) {
    base.resetBaseFields();
    nft.resetNftFields();
    appearanceState.resetAppearances();

    if (!keepBanner && clearBanner) {
      clearBanner();
    }
  }

  function loadIntoState(m: MediaItem) {
    base.loadBaseIntoState(m);
    nft.loadNftIntoState(m);
    appearanceState.loadAppearancesIntoState(m);
  }

  function setPrimaryCategory(key: MediaCategory) {
    base.setPrimaryCategory(key);

    if (key === "nft") {
      base.setMode("upload");
      base.setEmbedUrl("");
      nft.setNftEditionType("1/1");
      nft.setNftStatus("available");
    }
  }

  return {
    ...base,
    ...nft,
    ...appearanceState,
    setPrimaryCategory,
    loadIntoState,
    resetFields,
  };
}