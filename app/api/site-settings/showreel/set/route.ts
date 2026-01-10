import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const embedUrl = asString(body.embedUrl);
  if (!embedUrl || !embedUrl.startsWith("https://")) {
    return NextResponse.json({ ok: false, error: "Embed URL must start with https://" }, { status: 400 });
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