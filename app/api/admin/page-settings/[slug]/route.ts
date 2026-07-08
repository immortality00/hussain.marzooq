import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { EMPTY_SECTION_IMAGE, isSectionImage } from "@/lib/page-sections-shared";
import { deleteReplacedSectionImages } from "@/lib/server/section-images";

export const dynamic = "force-dynamic";

const VALID_SLUGS = new Set(["photography", "videography", "nft", "dancing", "web-development"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await isAdminAuthedServer();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  if (!VALID_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Unknown page slug" }, { status: 400 });
  }

  const body = await req.json();
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  const cardImage = isSectionImage(body.cardImage) ? body.cardImage : EMPTY_SECTION_IMAGE;

  const db = await getDb();

  // Delete a previously uploaded card image if it was replaced or removed.
  // Library-picked images have an empty publicId and are never deleted here.
  const existing = await db.collection("page_settings").findOne({ slug });
  await deleteReplacedSectionImages({ cardImage: existing?.cardImage }, { cardImage });

  await db.collection("page_settings").updateOne(
    { slug },
    { $set: { slug, isActive: body.isActive, cardImage, updatedAt: new Date() } },
    { upsert: true },
  );

  // Invalidate all pages that reference discipline links
  const AFFECTED_PATHS = ["/", "/about", "/blog", "/testimonials", "/people", "/dancing"];
  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({ slug, isActive: body.isActive, cardImage });
}
