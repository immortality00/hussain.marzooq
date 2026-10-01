import AdminTagsClient from "./AdminTagsClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["mediaTags"]}>
      <AdminTagsClient />
    </AdminScreen>
  );
}
