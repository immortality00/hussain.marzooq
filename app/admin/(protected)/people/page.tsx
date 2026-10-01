import PeopleAdminClient from "./PeopleAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["people"]}>
      <PeopleAdminClient />
    </AdminScreen>
  );
}
