import type { Db } from "mongodb";
import { asIsoDate as iso } from "@/app/api/_lib/common";
import { pageSettingsOf, readAllPageSettings, type PageSettings } from "./page-settings";
import { pageSeoOf, readAllPageSeo, type PageSeo } from "./page-seo";
import { pageSectionsOf, readAllPageSections, type PageSectionsSlug } from "./page-sections";

export const adminPageSettings = (s: PageSettings) => ({ ...s, updatedAt: iso(s.updatedAt) });
export const adminPageSeo = (s: PageSeo) => ({ ...s, updatedAt: iso(s.updatedAt) });
export const adminPageSections = (s: ReturnType<typeof pageSectionsOf>) => ({ data: s.data, updatedAt: iso(s.updatedAt) });

export type AdminPageSettings = ReturnType<typeof adminPageSettings>;
export type AdminPageSeo = ReturnType<typeof adminPageSeo>;
export type AdminPageSections = ReturnType<typeof adminPageSections>;

export async function loadAdminPages() {
  const [settings, seo, sections] = await Promise.all([readAllPageSettings(), readAllPageSeo(), readAllPageSections()]);
  return {
    settings: Object.fromEntries(settings.map((s) => [s.slug, adminPageSettings(s)])),
    seo: Object.fromEntries(seo.map((s) => [s.slug, adminPageSeo(s)])),
    sections: Object.fromEntries(sections.map((s) => [s.slug, s.data])),
    sectionsUpdatedAt: Object.fromEntries(sections.map((s) => [s.slug, iso(s.updatedAt)])),
  };
}

export async function storedPageSettings(db: Db, slug: string) {
  return adminPageSettings(pageSettingsOf(slug, await db.collection("page_settings").findOne({ slug })));
}

export async function storedPageSeo(db: Db, slug: string) {
  return adminPageSeo(pageSeoOf(slug, await db.collection("page_seo").findOne({ slug })));
}

export async function storedPageSections(db: Db, slug: PageSectionsSlug) {
  return adminPageSections(pageSectionsOf(slug, await db.collection("page_sections").findOne({ slug })));
}
