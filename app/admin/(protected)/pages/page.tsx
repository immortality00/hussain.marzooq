import { PagesAdminClient } from "./PagesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["pages"]}>
      <PagesAdminClient />
    </AdminScreen>
  );
}
