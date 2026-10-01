import { BlogEditorScreen } from "../BlogEditorScreen";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["blog"]}>
      <BlogEditorScreen editing />
    </AdminScreen>
  );
}
