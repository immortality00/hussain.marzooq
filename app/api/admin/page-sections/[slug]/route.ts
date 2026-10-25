import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidatePublicPattern, revalidatePublicTree, revalidateSitePages } from "@/app/api/_lib/revalidate";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { ALL_PAGE_SECTIONS_SLUGS, type PageSectionsSlug } from "@/lib/server/page-sections";
import { deleteReplacedSectionImages } from "@/lib/server/section-images";
import { storedPageSections } from "@/lib/server/admin-pages";
import { changedSinceOpened, recordChangedResponse } from "@/app/api/_lib/record-version";
import { isRecord } from "@/app/api/_lib/common";
import { normalizeSearchProfile, shownProfileLinks } from "@/lib/seo/search-profile";
import { resolveLinkLogos } from "@/lib/server/link-logos";
import { sectionsForSave } from "../_lib/sections-for-save";

const SLUG_TO_PATH: Record<PageSectionsSlug, string> = {
  home: "/",
  about: "/about",
  photography: "/photography",
  videography: "/videography",
  dancing: "/dancing",
  "web-development": "/web-development",
  blog: "/blog",
  nft: "/nft",
  people: "/people",
  "people-detail": "/people/[slug]",
  testimonials: "/testimonials",
  contact: "/contact",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await isAdminAuthedServer();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  if (!ALL_PAGE_SECTIONS_SLUGS.includes(slug as PageSectionsSlug)) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
  }

  const body: unknown = await req.json().catch(() => null);
  // The whole body is the sections blob, always replaced wholesale. Guard the
  // shape: a null/array/primitive body would corrupt the stored document and,
  // via the replace-delete diff below, orphan-delete every uploaded asset. An
  // empty object stays valid — "empty means empty" is intentional.
  if (!isRecord(body) || Array.isArray(body)) {
    return NextResponse.json({ error: "data must be an object" }, { status: 400 });
  }

  const checked = sectionsForSave(slug as PageSectionsSlug, body);
  if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
  const data = checked.data;

  const db = await getDb();

  // Delete uploaded section images that were replaced or removed in this save.
  const existing = await db.collection("page_sections").findOne({ slug });
  if (changedSinceOpened(req, existing)) {
    return recordChangedResponse(await storedPageSections(db, slug as PageSectionsSlug));
  }

  // The logos come from the links shown on the site and what is already stored,
  // never from the request; a logo whose link was removed or switched off is
  // deleted by the diff below.
  let logosMissing: string[] = [];
  if (slug === "about") {
    const shown = shownProfileLinks(normalizeSearchProfile(data.profile));
    const resolved = await resolveLinkLogos(db, shown, existing?.data?.linkLogos);
    data.linkLogos = resolved.logos;
    logosMissing = resolved.missing;
  }

  await deleteReplacedSectionImages(existing?.data, data);

  await db
    .collection("page_sections")
    .updateOne({ slug }, { $set: { data, updatedAt: new Date() } }, { upsert: true });

  const path = SLUG_TO_PATH[slug as PageSectionsSlug];
  if (slug === "about" || slug === "contact") {
    // Every public page shows the profile's social links and the footer's email list.
    revalidateSitePages();
  } else if (path === "/people/[slug]") {
    revalidatePublicPattern(path);
  } else if (path === "/") {
    revalidatePath(path);
  } else if (path) {
    revalidatePublicTree(path);
  }

  return NextResponse.json({
    ok: true,
    item: await storedPageSections(db, slug as PageSectionsSlug),
    ...(logosMissing.length ? { logosMissing } : {}),
  });
}
