import PrivateGalleriesAdminClient from "./PrivateGalleriesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["galleries", "media"]}>
      <PrivateGalleriesAdminClient />
    </AdminScreen>
  );
}
