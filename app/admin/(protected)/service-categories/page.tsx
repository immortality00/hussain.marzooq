import AdminServiceCategoriesClient from "./AdminServiceCategoriesClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["serviceCategories"]}>
      <AdminServiceCategoriesClient />
    </AdminScreen>
  );
}
