import PrivateGalleriesAdminClient from "./PrivateGalleriesAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { GALLERY_LIST_PARAMS } from "@/components/admin/private-galleries/gallery-list";

export default function Page() {
  return (
    <AdminScreen reads={["galleries", "media"]} stable={GALLERY_LIST_PARAMS}>
      <PrivateGalleriesAdminClient />
    </AdminScreen>
  );
}
