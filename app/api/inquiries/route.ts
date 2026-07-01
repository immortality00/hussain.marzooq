import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { claimDuplicateWindow, consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { sendInquiryNotification } from "@/lib/server/email";
import {
  asNullableString,
  isRecord,
  isValidObjectIdString,
  noStoreJson,
} from "@/app/api/_lib/common";
import {
  getClientAddress,
  isValidEmail,
  isValidFormStartedAt,
} from "@/app/api/_lib/public-form-security";

export const dynamic = "force-dynamic";

const INQUIRIES_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const INQUIRIES_RATE_LIMIT_MAX = 6;
const INQUIRIES_DUPLICATE_WINDOW_MS = 2 * 60_000;
const MINIMUM_FORM_TIME_MS = 2500;

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") ?? "").trim();
  const all = url.searchParams.get("all") === "1";

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (!all) filter.isArchived = { $ne: true };

  const db = await getDb();

  const docs = await db
    .collection("inquiries")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(300)
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    email: typeof d.email === "string" ? d.email : "",
    message: typeof d.message === "string" ? d.message : "",
    category: typeof d.category === "string" ? d.category : null,
    serviceId: typeof d.serviceId === "string" ? d.serviceId : null,
    serviceName: typeof d.serviceName === "string" ? d.serviceName : null,
    status: typeof d.status === "string" ? d.status : "new",
    adminNotes: typeof d.adminNotes === "string" ? d.adminNotes : "",
    isArchived: typeof d.isArchived === "boolean" ? d.isArchived : false,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
  }));

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const bodyUnknown = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  }

  const honeypot = (asNullableString(bodyUnknown.website) ?? "").trim();
  if (honeypot) {
    return noStoreJson({ ok: true });
  }

  const name = (asNullableString(bodyUnknown.name) ?? "").trim().slice(0, 120);
  const email = (asNullableString(bodyUnknown.email) ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const message = (asNullableString(bodyUnknown.message) ?? "").trim().slice(0, 4000);
  const requestedCategory = (asNullableString(bodyUnknown.category) ?? "").trim().slice(0, 120);
  const rawServiceId = (asNullableString(bodyUnknown.serviceId) ?? "").trim();
  const requestedServiceName = (asNullableString(bodyUnknown.serviceName) ?? "")
    .trim()
    .slice(0, 180);

  if (!name) {
    return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  }

  if (!email) {
    return noStoreJson({ ok: false, error: "Email is required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return noStoreJson({ ok: false, error: "Email format is invalid." }, { status: 400 });
  }

  if (!message) {
    return noStoreJson({ ok: false, error: "Message is required" }, { status: 400 });
  }

  let serviceId: string | null = null;
  if (rawServiceId) {
    if (!isValidObjectIdString(rawServiceId)) {
      return noStoreJson({ ok: false, error: "Invalid serviceId" }, { status: 400 });
    }
    serviceId = rawServiceId;
  }

  if (!isValidFormStartedAt(bodyUnknown.formStartedAt, MINIMUM_FORM_TIME_MS)) {
    return noStoreJson(
      { ok: false, error: "Submission was too fast. Please try again." },
      { status: 400 }
    );
  }

  const clientAddress = getClientAddress(req);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "public-inquiries",
    key: clientAddress,
    limit: INQUIRIES_RATE_LIMIT_MAX,
    windowMs: INQUIRIES_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson(
      { ok: false, error: "Too many submissions. Try again later." },
      { status: 429 }
    );
  }

  const duplicateKey = [
    email,
    serviceId ?? requestedServiceName ?? "",
    requestedCategory,
    message,
  ]
    .join("|")
    .toLowerCase();

  const dedupe = await claimDuplicateWindow({
    bucket: "public-inquiries-dedupe",
    key: duplicateKey,
    windowMs: INQUIRIES_DUPLICATE_WINDOW_MS,
  });

  if (dedupe.duplicated) {
    return noStoreJson(
      { ok: false, error: "This inquiry looks duplicated. Please wait before sending again." },
      { status: 409 }
    );
  }

  const db = await getDb();

  let category: string | null = requestedCategory || null;
  let serviceName: string | null = requestedServiceName || null;

  if (serviceId) {
    const service = await db.collection("services").findOne(
      { _id: new ObjectId(serviceId) },
      {
        projection: {
          _id: 1,
          name: 1,
          category: 1,
          isActive: 1,
          isArchived: 1,
        },
      }
    );

    if (!service) {
      return noStoreJson({ ok: false, error: "Unknown serviceId" }, { status: 400 });
    }

    if (service.isActive === false || service.isArchived === true) {
      return noStoreJson(
        { ok: false, error: "This service is not available for booking." },
        { status: 409 }
      );
    }

    serviceName = typeof service.name === "string" ? service.name : serviceName;
    category = typeof service.category === "string" ? service.category : category;
  }

  const now = new Date();

  const insertResult = await db.collection("inquiries").insertOne({
    name,
    email,
    message,
    category,
    serviceId,
    serviceName,
    status: "new",
    adminNotes: "",
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });

  if (serviceId) {
    await db.collection("services").updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $inc: { inquiriesCount: 1 },
        $set: { updatedAt: now },
      }
    );
  }

  sendInquiryNotification({ name, email, message, serviceName, category }).catch(() => {});

  return noStoreJson({ ok: true, id: String(insertResult.insertedId) });
}