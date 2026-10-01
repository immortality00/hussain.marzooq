import BlogCategoriesAdminClient from "./BlogCategoriesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["blogCategories"]}>
      <BlogCategoriesAdminClient />
    </AdminScreen>
  );
}
