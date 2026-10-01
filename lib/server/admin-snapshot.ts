import { createHash } from "node:crypto";
import { ADMIN_BUILD, pendingCount } from "@/lib/admin-data";
import { getDb } from "./db";
import { getAdminDashboardStats } from "./admin-dashboard";
import { listAdminBlogCategories, listAdminMediaTags, listAdminServiceCatalog } from "./admin-catalog";
import {
  listAdminInquiries,
  listAdminPeople,
  listAdminPrivateGalleries,
  listAdminTestimonials,
} from "./admin-lists";
import { listAdminMediaWithItems } from "./admin-media";
import { loadAdminPages } from "./admin-pages";
import { getVapidPublicKey, listPushDevices } from "./push";
import { getRemovalRequestHistory, getRemovalRequestQueue } from "./removal-requests";
import { pageFlags } from "@/app/admin/(protected)/pages/lib/rows";
import { loadAdminBlog } from "@/app/admin/(protected)/blog/lib/server";

export async function buildAdminSnapshot({ mediaCount }: { mediaCount: number }) {
  const db = await getDb();
  const [
    stats,
    pages,
    pushDevices,
    inquiries,
    testimonials,
    people,
    galleries,
    media,
    mediaTags,
    blog,
    blogCategories,
    serviceCatalog,
    removalItems,
    removalHistory,
  ] = await Promise.all([
    getAdminDashboardStats(),
    loadAdminPages(),
    listPushDevices(),
    listAdminInquiries(),
    listAdminTestimonials(),
    listAdminPeople(),
    listAdminPrivateGalleries(),
    listAdminMediaWithItems(new URLSearchParams({ limit: String(mediaCount) })),
    listAdminMediaTags(db),
    loadAdminBlog(),
    listAdminBlogCategories(db),
    listAdminServiceCatalog(db),
    getRemovalRequestQueue(),
    getRemovalRequestHistory(),
  ]);

  return {
    build: ADMIN_BUILD,
    dashboard: { stats, ...pageFlags(pages) },
    notificationCount: pendingCount(stats),
    push: { publicKey: getVapidPublicKey(), devices: pushDevices },
    pages,
    inquiries,
    testimonials,
    people,
    galleries,
    media,
    mediaTags,
    blog,
    blogCategories,
    services: serviceCatalog.services,
    serviceCategories: serviceCatalog.categories,
    removal: { items: removalItems, history: removalHistory },
  };
}

export type AdminSnapshot = Awaited<ReturnType<typeof buildAdminSnapshot>>;

export function snapshotVersion(snapshot: AdminSnapshot) {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("base64url");
}
