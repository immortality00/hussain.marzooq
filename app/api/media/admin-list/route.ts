import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { toAdminMediaListItem } from "@/lib/server/media-serializers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 120), 1), 300);

  const db = await getDb();

  const docs = await db.collection("media").find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  const items = docs.map((doc) => toAdminMediaListItem(doc as Record<string, unknown>));

  return noStoreJson({ ok: true, items });
}