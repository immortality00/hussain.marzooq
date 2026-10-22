import { withRouteErrors } from "@/app/api/_lib/route-errors";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { setAdminSession } from "@/lib/auth/admin";
import { fromAnotherSite } from "@/lib/auth/same-site";
import { readSessionGeneration } from "@/lib/server/admin-security";
import { verifyPasskeyAnswer } from "@/lib/server/passkeys";
import { failPasskeyAttempt, finishSignInRequest, takeSignInChallenge } from "@/lib/server/sign-in-requests";
import { SECOND_STEP_LIMIT } from "../_lib/limits";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { clearPending, expired, json, limited, pendingRequest, refuse } from "../_lib/respond";

async function handlePOST(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);
  if (await limited(req, ...SECOND_STEP_LIMIT)) return refuse("locked", 429);

  const answer = await readJsonObject(req);
  if (!answer || typeof answer.id !== "string") return refuse("passkey", 400);

  const request = await pendingRequest(req);
  if (!request) return expired();

  const challenge = await takeSignInChallenge(request._id);
  if (!challenge) return expired();

  if (!(await verifyPasskeyAnswer(answer as unknown as AuthenticationResponseJSON, challenge))) {
    await failPasskeyAttempt(request._id);
    return refuse("passkey", 401);
  }

  const finished = await finishSignInRequest(request._id);
  if (!finished) return expired();

  const res = clearPending(json({ ok: true, next: finished.next }));
  await setAdminSession(res, { remember: finished.remember, generation: await readSessionGeneration(), trust: true });
  return res;
}

export const POST = withRouteErrors(handlePOST);
