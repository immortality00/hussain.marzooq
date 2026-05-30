import { requireAdminOr401 } from "@/lib/auth/admin";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const embedUrl = asNullableString(body.embedUrl)?.trim() ?? "";
  if (!embedUrl) {
    return noStoreJson({ ok: false, error: "embedUrl is required" }, { status: 400 });
  }

  const db = await getDb();

  await db.collection("site_settings").updateOne(
    { key: "showreel" },
    { $set: { key: "showreel", value: embedUrl, updatedAt: new Date() } },
    { upsert: true }
  );

  return noStoreJson({ ok: true });
}