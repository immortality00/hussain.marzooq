import { revalidatePath } from "next/cache";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { MIN_PERSON_PASSWORD_LENGTH, hashPassword, makeAccessToken } from "@/lib/password-gate";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const action = (asNullableString(body.action) ?? "").trim();
  if (action !== "approve" && action !== "dismiss") {
    return noStoreJson({ ok: false, error: "Unknown action." }, { status: 400 });
  }

  const db = await getDb();
  const found = await findByIdOr404(db, "people_profiles", oid, {
    projection: { name: 1, slug: 1 },
  });
  if (found instanceof Response) return found;
  const { doc } = found;

  const slug = typeof doc.slug === "string" ? doc.slug : null;
  const name = typeof doc.name === "string" ? doc.name : "";
  const now = new Date();

  if (action === "dismiss") {
    await db.collection("people_profiles").updateOne(
      { _id: oid },
      {
        $set: { updatedAt: now },
        $unset: { removalRequestedAt: "", removalRequestEmail: "", removalRequestReason: "" },
      }
    );
    await db
      .collection("removal_requests")
      .updateMany({ personId: id, status: "pending" }, { $set: { status: "dismissed", decidedAt: now } });

    revalidatePath("/admin/removal-requests");
    return noStoreJson({ ok: true });
  }

  const password = (asNullableString(body.password) ?? "").trim();
  if (password.length < MIN_PERSON_PASSWORD_LENGTH) {
    return noStoreJson(
      { ok: false, error: `Password must be at least ${MIN_PERSON_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const accessToken = makeAccessToken();
  const passwordHash = await hashPassword(password);

  await db.collection("people_profiles").updateOne(
    { _id: oid },
    {
      $set: {
        isPrivate: true,
        accessToken,
        passwordHash,
        removalApprovedAt: now,
        updatedAt: now,
      },
      $unset: { removalRequestedAt: "", removalRequestEmail: "", removalRequestReason: "" },
    }
  );

  await db.collection("media").updateMany(
    { $or: [{ peopleIds: id }, ...(name ? [{ people: name }] : [])], isPublic: true },
    { $set: { isPublic: false, updatedAt: now }, $addToSet: { removalHiddenBy: id } }
  );

  await db
    .collection("removal_requests")
    .updateMany({ personId: id, status: "pending" }, { $set: { status: "approved", decidedAt: now } });

  revalidatePath("/admin/removal-requests");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/people/${slug}`);

  return noStoreJson({ ok: true });
}
