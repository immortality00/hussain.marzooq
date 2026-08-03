import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { resolveOptionalCardImage } from "@/lib/page-sections-shared";
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

  // Only touch cardImage when the key is present. An omitted cardImage means
  // "leave it unchanged" — never blank it (and never delete its Cloudinary
  // asset) just because a partial PATCH didn't mention it.
  const cardImage = resolveOptionalCardImage(body);

  const db = await getDb();

  const set: Record<string, unknown> = {
    slug,
    isActive: body.isActive,
    updatedAt: new Date(),
  };

  if (cardImage !== undefined) {
    // Delete a previously uploaded card image if it was replaced or removed.
    // Library-picked images have an empty publicId and are never deleted here.
    const existing = await db.collection("page_settings").findOne({ slug });
    await deleteReplacedSectionImages({ cardImage: existing?.cardImage }, { cardImage });
    set.cardImage = cardImage;
  }

  await db.collection("page_settings").updateOne({ slug }, { $set: set }, { upsert: true });

  // Invalidate all pages that reference discipline links
  const AFFECTED_PATHS = ["/", "/about", "/blog", "/testimonials", "/people", "/dancing"];
  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({
    slug,
    isActive: body.isActive,
    ...(cardImage !== undefined ? { cardImage } : {}),
  });
}
