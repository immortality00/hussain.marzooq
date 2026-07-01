import { revalidatePath } from "next/cache";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { isRecord, noStoreJson, parseObjectId } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

type ReorderItem = {
  id: string;
  sortOrder: number;
};

function isValidReorderItem(value: unknown): value is ReorderItem {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.sortOrder !== "number" || !Number.isFinite(value.sortOrder)) return false;
  return true;
}

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body) || !Array.isArray(body.items)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const items = body.items.filter(isValidReorderItem);
  if (items.length === 0 || items.length !== body.items.length) {
    return noStoreJson({ ok: false, error: "Invalid reorder payload." }, { status: 400 });
  }

  const normalized = items
    .map((item) => ({
      id: item.id,
      sortOrder: Math.max(0, Math.round(item.sortOrder)),
      oid: parseObjectId(item.id),
    }))
    .filter((item) => item.oid);

  if (normalized.length !== items.length) {
    return noStoreJson({ ok: false, error: "One or more testimonial IDs are invalid." }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();

  await Promise.all(
    normalized.map((item) =>
      db.collection("testimonials").updateOne(
        { _id: item.oid! },
        { $set: { sortOrder: item.sortOrder, updatedAt: now } }
      )
    )
  );

  revalidatePath("/testimonials");
  revalidatePath("/");

  return noStoreJson({ ok: true });
}