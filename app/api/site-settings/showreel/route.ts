import clientPromise from "@/lib/mongodb";
import { asNullableString, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("site_settings").findOne({ key: "showreel" });
  const value = doc ? asNullableString(doc.value) : null;

  return noStoreJson({ embedUrl: value });
}