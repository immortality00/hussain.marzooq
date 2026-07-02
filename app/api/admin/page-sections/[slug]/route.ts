import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { ALL_PAGE_SECTIONS_SLUGS, type PageSectionsSlug } from "@/lib/server/page-sections";

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

  const db = await getDb();
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
