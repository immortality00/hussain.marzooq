import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { queueAdminAlert } from "@/lib/server/admin-alerts";
import { loadAdminSecurity } from "@/lib/server/admin-security-state";
import { verifyPasskeyAnswer } from "@/lib/server/passkeys";
import { decideApproval, findPendingApproval, takeApprovalChallenge } from "@/lib/server/sign-in-requests";

export const dynamic = "force-dynamic";

const gone = () => noStoreJson({ ok: false, error: "This sign-in request has expired." }, { status: 404 });

async function refuseSignIn(id: string, device: string, reason: "rejected" | "wrong-number") {
  if (!(await decideApproval(id, "rejected"))) return false;
  console.warn(`[admin-auth] sign-in refused (${reason}): ${device}`);
  queueAdminAlert({ kind: "sign-in-refused", device, reason });
  return true;
}

/** Reject, or approve by picking the number the waiting browser shows and answering Face ID / Touch ID. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const { id } = await ctx.params;
  const body = await readJsonObject(req);
  if (body?.decision !== "approve" && body?.decision !== "reject") {
    return noStoreJson({ ok: false, error: "Choose approve or reject." }, { status: 400 });
  }

  const request = await findPendingApproval(id);
  if (!request?.approval) return gone();

  if (body.decision === "reject") {
    if (!(await refuseSignIn(request._id, request.device, "rejected"))) return gone();
    return noStoreJson({ ok: true, security: await loadAdminSecurity() });
  }

  if (typeof body.choice !== "number" || !request.approval.choices.includes(body.choice)) {
    return noStoreJson({ ok: false, error: "Pick one of the numbers." }, { status: 400 });
  }
  if (body.choice !== request.approval.number) {
    if (!(await refuseSignIn(request._id, request.device, "wrong-number"))) return gone();
    return noStoreJson(
      { ok: false, error: "Wrong number: the sign-in was refused.", security: await loadAdminSecurity() },
      { status: 409 }
    );
  }

  const challenge = await takeApprovalChallenge(request._id);
  const response = body.response;
  if (!challenge || !isRecord(response) || typeof response.id !== "string") {
    return noStoreJson({ ok: false, error: "Face ID / Touch ID is needed to approve." }, { status: 400 });
  }
  if (!(await verifyPasskeyAnswer(response as unknown as AuthenticationResponseJSON, challenge))) {
    return noStoreJson({ ok: false, error: "The passkey was not accepted." }, { status: 401 });
  }

  if (!(await decideApproval(request._id, "approved"))) return gone();
  console.warn(`[admin-auth] sign-in approved: ${request.device}`);
  return noStoreJson({ ok: true, security: await loadAdminSecurity() });
}
