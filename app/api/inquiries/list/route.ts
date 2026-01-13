import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function looksTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "ok" || s.length > 10;
}

async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const knownNames = ["admin", "admin_auth", "admin_session", "admin_token", "hm_admin"];
  for (const name of knownNames) {
    const v = store.get(name)?.value;
    if (typeof v === "string" && looksTruthy(v)) return true;
  }
  const all = store.getAll();
  for (const c of all) {
    const name = c.name.toLowerCase();
    if (name.includes("admin") && looksTruthy(c.value)) return true;
  }
  return false;
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export async function GET() {
  const okAdmin = await isAdminRequest();
  if (!okAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("inquiries")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: asString(d.name) ?? "",
    email: asString(d.email) ?? "",
    message: asString(d.message) ?? "",
    service: asString(d.service),
    category: asString(d.category),
    status: asString(d.status) ?? "new",
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
  }));

  const res = NextResponse.json({ ok: true, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}