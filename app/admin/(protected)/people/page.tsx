import PeopleAdminClient from "./PeopleAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { PEOPLE_LIST_PARAMS } from "./lib/people-list";

export default function Page() {
  return (
    <AdminScreen reads={["people"]} stable={PEOPLE_LIST_PARAMS}>
      <PeopleAdminClient />
    </AdminScreen>
  );
}
