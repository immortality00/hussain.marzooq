import { createHash } from "node:crypto";
import { getDb } from "./db";
import { getAdminDashboardStats, getAdminNotificationCount } from "./admin-dashboard";
import { listAdminBlogCategories, listAdminMediaTags, listAdminServiceCatalog } from "./admin-catalog";
import {
  listAdminInquiries,
  listAdminPeople,
  listAdminPrivateGalleries,
  listAdminTestimonials,
} from "./admin-lists";
import { listAdminMediaWithItems } from "./admin-media";
import { getAllPageSettings } from "./page-settings";
import { getAllPageSeo } from "./page-seo";
import { getAllPageSections } from "./page-sections";
import { getVapidPublicKey, listPushDevices } from "./push";
import { getRemovalRequestHistory, getRemovalRequestQueue } from "./removal-requests";
import { pageFlags } from "@/app/admin/(protected)/pages/lib/rows";
import { loadBlogList, loadCategoryOptions, loadPostForms } from "@/app/admin/(protected)/blog/lib/server";

export const MEDIA_PAGE_SIZE = 60;

async function loadPages() {
  const [settings, seo, sections] = await Promise.all([getAllPageSettings(), getAllPageSeo(), getAllPageSections()]);
  return {
    settings: Object.fromEntries(settings.map((s) => [s.slug, s])),
    seo: Object.fromEntries(seo.map((s) => [s.slug, s])),
    sections: Object.fromEntries(sections.map((s) => [s.slug, s.data])),
  };
}

export async function buildAdminSnapshot() {
  const db = await getDb();
  const [
    stats,
    notificationCount,
    pages,
    pushDevices,
    inquiries,
    testimonials,
    people,
    galleries,
    media,
    mediaTags,
    blogPosts,
    blogForms,
    blogCategoryOptions,
    blogCategories,
    serviceCatalog,
    removalItems,
    removalHistory,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getAdminNotificationCount(),
    loadPages(),
    listPushDevices(),
    listAdminInquiries({ all: true }),
    listAdminTestimonials(),
    listAdminPeople(),
    listAdminPrivateGalleries(),
    listAdminMediaWithItems(new URLSearchParams({ limit: String(MEDIA_PAGE_SIZE) })),
    listAdminMediaTags(db),
    loadBlogList(),
    loadPostForms(),
    loadCategoryOptions(),
    listAdminBlogCategories(db),
    listAdminServiceCatalog(db),
    getRemovalRequestQueue(),
    getRemovalRequestHistory(),
  ]);

  return {
    dashboard: { stats, ...pageFlags(pages) },
    notificationCount,
    push: { publicKey: getVapidPublicKey(), devices: pushDevices },
    pages,
    inquiries,
    testimonials,
    people,
    galleries,
    media,
    mediaTags,
    blog: { posts: blogPosts, forms: blogForms, categoryOptions: blogCategoryOptions },
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
