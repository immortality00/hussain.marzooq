import MediaListClient from "./MediaListClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { MediaOptionsProvider } from "../components/MediaOptionsContext";
import { MEDIA_LIST_PARAMS } from "../lib/media-list-address";

export default function Page() {
  return (
    <AdminScreen reads={["media", "people", "mediaTags"]} stable={MEDIA_LIST_PARAMS}>
      <MediaOptionsProvider>
        <MediaListClient />
      </MediaOptionsProvider>
    </AdminScreen>
  );
}
