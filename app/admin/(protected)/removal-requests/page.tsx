import RemovalRequestsClient from "./RemovalRequestsClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["removal"]}>
      <RemovalRequestsClient />
    </AdminScreen>
  );
}
