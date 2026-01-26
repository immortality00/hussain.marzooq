import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const embedUrl = asString(body.embedUrl)?.trim() ?? "";
  if (!embedUrl) {
    return NextResponse.json({ ok: false, error: "embedUrl is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("site_settings").updateOne(
    { key: "showreel" },
    { $set: { key: "showreel", value: embedUrl, updatedAt: new Date() } },
    { upsert: true }
  );

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}