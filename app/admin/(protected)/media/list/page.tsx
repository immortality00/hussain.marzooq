import MediaListClient from "./MediaListClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["media"]}>
      <MediaListClient />
    </AdminScreen>
  );
}
