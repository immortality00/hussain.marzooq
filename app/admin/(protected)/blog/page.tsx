import BlogAdminClient from "./BlogAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["blog"]}>
      <BlogAdminClient />
    </AdminScreen>
  );
}
