import { AdminLink } from "@/components/admin/AdminLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import BatchMediaClient from "./BatchMediaClient";
import { MediaOptionsProvider } from "../components/MediaOptionsContext";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { BackToList } from "@/components/admin/BackToList";
import { MEDIA_LIST_PATH } from "../lib/media-list-address";

export default function AdminMediaBatchPage() {
  return (
    <AdminScreen reads={["people", "mediaTags"]}>
      <MediaOptionsProvider>
        <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
          <AdminPageHeader
            title="Batch upload"
            actions={
              <>
                <BackToList href={MEDIA_LIST_PATH} />
                <AdminLink href="/admin/media" className={adminButtonClasses("default", "md")}>
                  Single upload
                </AdminLink>
              </>
            }
          />

          <BatchMediaClient />
        </main>
      </MediaOptionsProvider>
    </AdminScreen>
  );
}
