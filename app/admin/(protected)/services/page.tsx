import AdminServicesClient from "./AdminServicesClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["services", "serviceCategories"]}>
      <AdminServicesClient />
    </AdminScreen>
  );
}
