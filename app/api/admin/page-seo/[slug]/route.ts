import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { ALL_SEO_SLUGS } from "@/lib/server/page-seo";

const SLUG_TO_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  photography: "/photography",
  videography: "/videography",
  nft: "/nft",
  dancing: "/dancing",
  "web-development": "/web-development",
  contact: "/contact",
  services: "/services",
  people: "/people",
  blog: "/blog",
  testimonials: "/testimonials",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await isAdminAuthedServer();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  if (!ALL_SEO_SLUGS.includes(slug)) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
  }

  const body = await req.json();
  const update: Record<string, string | Date> = { updatedAt: new Date() };
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.ogImageUrl === "string") update.ogImageUrl = body.ogImageUrl;

  const db = await getDb();
  await db
    .collection("page_seo")
    .updateOne({ slug }, { $set: update }, { upsert: true });

  const path = SLUG_TO_PATH[slug];
  if (path) revalidatePath(path);

  return NextResponse.json({ ok: true });
}
