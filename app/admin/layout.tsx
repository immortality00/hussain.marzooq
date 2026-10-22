import type { Metadata } from "next";
import { ADMIN_APP_TITLE, ADMIN_MANIFEST_PATH, ADMIN_STATUS_BAR_STYLE } from "@/lib/admin-app";

export const metadata: Metadata = {
  manifest: ADMIN_MANIFEST_PATH,
  appleWebApp: { capable: true, title: ADMIN_APP_TITLE, statusBarStyle: ADMIN_STATUS_BAR_STYLE },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
