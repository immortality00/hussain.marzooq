import InquiriesAdminClient from "./InquiriesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["inquiries"]}>
      <InquiriesAdminClient />
    </AdminScreen>
  );
}
