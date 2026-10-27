import MediaListClient from "./MediaListClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { MediaOptionsProvider } from "../components/MediaOptionsContext";

export default function Page() {
  return (
    <AdminScreen reads={["media", "people"]}>
      <MediaOptionsProvider>
        <MediaListClient />
      </MediaOptionsProvider>
    </AdminScreen>
  );
}
