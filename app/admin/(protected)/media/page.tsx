import { MediaEditorScreen } from "./MediaEditorScreen";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { MEDIA_EDITOR_PARAMS } from "./lib/media-list-address";

export default function Page() {
  return (
    <AdminScreen reads={["media", "people", "mediaTags"]} stable={MEDIA_EDITOR_PARAMS}>
      <MediaEditorScreen />
    </AdminScreen>
  );
}
