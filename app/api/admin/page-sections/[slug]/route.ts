import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { ALL_PAGE_SECTIONS_SLUGS, type PageSectionsSlug } from "@/lib/server/page-sections";
import { deleteReplacedSectionImages } from "@/lib/server/section-images";
import { isRecord } from "@/app/api/_lib/common";

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

  const data = await req.json();
  // The whole body is the sections blob, always replaced wholesale. Guard the
  // shape: a null/array/primitive body would corrupt the stored document and,
  // via the replace-delete diff below, orphan-delete every uploaded asset. An
  // empty object stays valid — "empty means empty" is intentional.
  if (!isRecord(data) || Array.isArray(data)) {
    return NextResponse.json({ error: "data must be an object" }, { status: 400 });
  }

  const db = await getDb();

  // Delete uploaded section images that were replaced or removed in this save.
  const existing = await db.collection("page_sections").findOne({ slug });
  await deleteReplacedSectionImages(existing?.data, data);

  await db
    .collection("page_sections")
    .updateOne({ slug }, { $set: { data, updatedAt: new Date() } }, { upsert: true });

  const path = SLUG_TO_PATH[slug as PageSectionsSlug];
  if (path === "/people/[slug]") {
    revalidatePath(path, "page");
  } else if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true });
}
