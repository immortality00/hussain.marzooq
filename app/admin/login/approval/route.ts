import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { setAdminSession } from "@/lib/auth/admin";
import { fromAnotherSite } from "@/lib/auth/same-site";
import { readSessionGeneration } from "@/lib/server/admin-security";
import { queueApprovalRequest } from "@/lib/server/admin-alerts";
import { dropSignInRequest, finishSignInRequest, startApproval } from "@/lib/server/sign-in-requests";
import { APPROVAL_CHECK_LIMIT, APPROVAL_START_LIMIT } from "../_lib/limits";
import { clearPending, expired, json, limited, pendingRequest, refuse } from "../_lib/respond";

export const dynamic = "force-dynamic";

/** Asks the signed-in devices to approve this browser; returns the number they must match. */
async function handlePOST(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);
  if (await limited(req, ...APPROVAL_START_LIMIT)) return refuse("locked", 429);

  const request = await pendingRequest(req);
  if (!request) return expired();

  const { number, started } = await startApproval(request);
  if (started) queueApprovalRequest(request.device);
  return json({ ok: true, number, expiresAt: request.expiresAt.toISOString() });
}

/** Polled by the waiting browser; signs it in once another device approves. */
async function handleGET(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);
  if (await limited(req, ...APPROVAL_CHECK_LIMIT)) return refuse("locked", 429);

  const request = await pendingRequest(req);
  if (!request?.approval) return expired();

  if (request.approval.status === "pending") return json({ ok: true, status: "pending" });

  if (request.approval.status === "rejected") {
    await dropSignInRequest(request._id);
    return clearPending(refuse("rejected", 403));
  }

  const finished = await finishSignInRequest(request._id);
  if (!finished) return expired();

  const res = clearPending(json({ ok: true, status: "approved", next: finished.next }));
  await setAdminSession(res, { remember: finished.remember, generation: await readSessionGeneration(), trust: true });
  return res;
}

export const POST = withRouteErrors(handlePOST);

export const GET = withRouteErrors(handleGET);
