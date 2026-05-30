import { asNullableString, noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();

  const doc = await db.collection("site_settings").findOne({ key: "showreel" });
  const value = doc ? asNullableString(doc.value) : null;

  return noStoreJson({ embedUrl: value });
}