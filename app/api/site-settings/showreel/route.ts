import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const doc = await db.collection("site_settings").findOne({ key: "showreel" });
  const value = doc ? asString(doc.value) : null;

  const res = NextResponse.json({ embedUrl: value });
  res.headers.set("Cache-Control", "no-store");
  return res;
}