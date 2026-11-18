import BlogAdminClient from "./BlogAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { BLOG_LIST_PARAMS } from "./lib/post-status";

export default function Page() {
  return (
    <AdminScreen reads={["blog"]} stable={BLOG_LIST_PARAMS}>
      <BlogAdminClient />
    </AdminScreen>
  );
}
