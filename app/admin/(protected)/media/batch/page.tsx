import { AdminLink } from "@/components/admin/AdminLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import BatchMediaClient from "./BatchMediaClient";
import { MediaOptionsProvider } from "../components/MediaOptionsContext";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function AdminMediaBatchPage() {
  return (
    <AdminScreen reads={["people", "mediaTags"]}>
      <MediaOptionsProvider>
        <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
          <AdminPageHeader
            title="Batch Upload"
            actions={
              <>
                <AdminLink href="/admin/media" className={adminButtonClasses("default", "md")}>
                  Single upload
                </AdminLink>
                <AdminLink href="/admin/media/list" className={adminButtonClasses("default", "md")}>
                  View list
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
