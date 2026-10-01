import { MediaEditorScreen } from "./MediaEditorScreen";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["media", "people", "mediaTags"]}>
      <MediaEditorScreen />
    </AdminScreen>
  );
}
