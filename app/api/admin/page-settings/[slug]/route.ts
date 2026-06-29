import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";

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

  const db = await getDb();
  await db.collection("page_settings").updateOne(
    { slug },
    { $set: { slug, isActive: body.isActive, updatedAt: new Date() } },
    { upsert: true },
  );

  // Invalidate all pages that reference discipline links
  const AFFECTED_PATHS = ["/", "/about", "/blog", "/testimonials", "/people", "/dancing"];
  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({ slug, isActive: body.isActive });
}
