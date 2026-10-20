import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { storedPageSettings } from "@/lib/server/admin-pages";
import { changedSinceOpened, recordChangedResponse } from "@/app/api/_lib/record-version";

export const dynamic = "force-dynamic";

const VALID_SLUGS = new Set([
  "photography",
  "videography",
  "nft",
  "dancing",
  "web-development",
  "blog",
]);

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

  const body = (await req.json().catch(() => null)) as { isActive?: unknown } | null;
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("page_settings").findOne({ slug });
  if (changedSinceOpened(req, existing)) return recordChangedResponse(await storedPageSettings(db, slug));

  await db
    .collection("page_settings")
    .updateOne({ slug }, { $set: { slug, isActive: body.isActive, updatedAt: new Date() } }, { upsert: true });

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, item: await storedPageSettings(db, slug) });
}
