import InquiriesAdminClient from "./InquiriesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { INQUIRY_PARAMS } from "@/lib/admin-links";

export default function Page() {
  return (
    <AdminScreen reads={["inquiries"]} stable={INQUIRY_PARAMS}>
      <InquiriesAdminClient />
    </AdminScreen>
  );
}
