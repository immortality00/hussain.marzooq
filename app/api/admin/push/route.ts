import { requireAdminOr401 } from "@/lib/auth/admin";
import { isRecord, noStoreJson, parseObjectId } from "@/app/api/_lib/common";
import { parsePushSubscription } from "@/lib/push-subscription";
import {
  isPushConfigured,
  removePushDevice,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/server/push";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  if (!isPushConfigured()) {
    return noStoreJson({ ok: false, error: "Push is not configured on the server." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const subscription = parsePushSubscription(body.subscription);
  if (!subscription) {
    return noStoreJson({ ok: false, error: "Invalid push subscription." }, { status: 400 });
  }

  await savePushSubscription(subscription, typeof body.label === "string" ? body.label : "");
  return noStoreJson({ ok: true });
}

export async function DELETE(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return noStoreJson({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (endpoint) {
    await removePushSubscription(endpoint);
    return noStoreJson({ ok: true });
  }

  const oid = typeof body.id === "string" ? parseObjectId(body.id) : null;
  if (oid) {
    await removePushDevice(oid);
    return noStoreJson({ ok: true });
  }

  return noStoreJson({ ok: false, error: "Missing endpoint or id." }, { status: 400 });
}
