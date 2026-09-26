import { MediaInUseError } from "@/lib/client/media-usage-api";
import type {
  AskMediaUsage,
  MediaUsageOption,
} from "@/components/admin/media-usage/useMediaUsageDialog";
import { deleteMediaItem, saveMediaItem } from "./editor-actions";

export const REMOVE_AND_DELETE: MediaUsageOption = {
  answer: "remove",
  label: "Remove from those places and delete",
  variant: "danger",
};

function replaceOptions(canReplace: boolean): MediaUsageOption[] {
  const useNew: MediaUsageOption = { answer: "replace", label: "Use the new photo there", variant: "solid" };
  return [...(canReplace ? [useNew] : []), { answer: "remove", label: "Remove from those places" }];
}

export async function deleteWithUsageCheck(id: string, ask: AskMediaUsage) {
  try {
    await deleteMediaItem(id);
    return true;
  } catch (e: unknown) {
    if (!(e instanceof MediaInUseError)) throw e;
    if ((await ask(e.items, [REMOVE_AND_DELETE])) !== "remove") return false;
    await deleteMediaItem(id, true);
    return true;
  }
}

export async function saveWithUsageCheck(args: Parameters<typeof saveMediaItem>[0], ask: AskMediaUsage) {
  try {
    return await saveMediaItem(args);
  } catch (e: unknown) {
    if (!(e instanceof MediaInUseError)) throw e;
    const answer = await ask(e.items, replaceOptions(e.canReplace));
    if (answer !== "replace" && answer !== "remove") return null;
    return saveMediaItem({ ...args, usages: answer });
  }
}
