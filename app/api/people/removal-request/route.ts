import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/server/db";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress, isValidEmail } from "@/app/api/_lib/public-form-security";
import {
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const slug = (asNullableString(body.slug) ?? "").trim();
  const email = (asNullableString(body.email) ?? "").trim().slice(0, 200);
  const reason = (asNullableString(body.reason) ?? "").trim().slice(0, 1000);

  if (!slug) {
    return noStoreJson({ ok: false, error: "Slug is required." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return noStoreJson({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  if (!reason) {
    return noStoreJson({ ok: false, error: "A message is required." }, { status: 400 });
  }

  const key = getClientAddress(req);
  const currentLimit = await getFixedWindowRateLimitStatus({
    bucket: "person-removal-request",
    key,
    limit: REQUEST_LIMIT,
  });

  if (currentLimit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  await consumeFixedWindowRateLimit({
    bucket: "person-removal-request",
    key,
    limit: REQUEST_LIMIT,
    windowMs: REQUEST_WINDOW_MS,
  });

  const db = await getDb();
  const now = new Date();

  const doc = await db.collection("people_profiles").findOne({ slug });

  if (!doc) {
    return noStoreJson({ ok: false, error: "Profile not found." }, { status: 404 });
  }

  if (doc.isPublic === false || doc.isPrivate === true) {
    return noStoreJson(
      { ok: false, error: "This profile is already private or hidden." },
      { status: 409 }
    );
  }

  const name = typeof doc.name === "string" ? doc.name : "";

  await db.collection("people_profiles").updateOne(
    { _id: doc._id },
    {
      $set: {
        removalRequestedAt: now,
        removalRequestEmail: email,
        removalRequestReason: reason,
        updatedAt: now,
      },
    }
  );

  await db.collection("removal_requests").insertOne({
    personId: String(doc._id),
    personName: name,
    slug,
    email,
    reason,
    status: "pending",
    createdAt: now,
    decidedAt: null,
  });

  revalidatePath("/admin/removal-requests");

  return noStoreJson({ ok: true });
}
