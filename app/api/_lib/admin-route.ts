import type { Db, Document, FindOptions, WithId } from "mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson, parseObjectId } from "@/app/api/_lib/common";

type IdRouteContext = { params: Promise<{ id: string }> };

/**
 * Admin [id]-route preamble: enforce admin auth first, then resolve and validate
 * the `:id` param as a Mongo ObjectId. Returns a short-circuit Response (401 or
 * 400) or the parsed id pair. Keeping auth-before-validation in one place is the
 * point — every admin mutation route runs the same gate. Both the raw `id`
 * string and the parsed `oid` are returned so routes needing either don't
 * re-parse.
 */
export async function requireAdminObjectId(
  ctx: IdRouteContext
): Promise<Response | { id: string; oid: ObjectId }> {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  return { id, oid };
}

/**
 * findOne on `collection` by `_id`, returning a 404 Response when absent.
 * Callable anywhere in a handler (e.g. after body validation), not just at the
 * top. Pass `options` for projections.
 */
export async function findByIdOr404(
  db: Db,
  collection: string,
  oid: ObjectId,
  options?: FindOptions
): Promise<Response | { doc: WithId<Document> }> {
  const doc = await db.collection(collection).findOne<WithId<Document>>({ _id: oid }, options);
  if (!doc) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });
  return { doc };
}

/** DELETE `?hard=1` flag — soft-archive (default) vs hard-delete. */
export function wantsHardDelete(req: Request): boolean {
  return new URL(req.url).searchParams.get("hard") === "1";
}
