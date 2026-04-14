import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["new", "pending", "replied", "approved", "rejected", "resolved"]);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const status = asString(body.status).trim();
  const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) : null;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (status) {
    if (!ALLOWED.has(status)) return noStore({ ok: false, error: "Invalid status" }, { status: 400 });
    patch.status = status;
  }
  if (adminNotes !== null) patch.adminNotes = adminNotes;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("inquiries").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  return noStore({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  if (!hard) {
    await db.collection("inquiries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true, updatedAt: new Date() } }
    );
    return noStore({ ok: true, mode: "archived" });
  }

  await db.collection("inquiries").deleteOne({ _id: new ObjectId(id) });
  return noStore({ ok: true, mode: "deleted" });
}