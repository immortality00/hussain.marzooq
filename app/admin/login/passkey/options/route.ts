import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { fromAnotherSite } from "@/lib/auth/same-site";
import { passkeyAuthenticationOptions } from "@/lib/server/passkeys";
import { setSignInChallenge } from "@/lib/server/sign-in-requests";
import { SECOND_STEP_LIMIT } from "../../_lib/limits";
import { expired, json, limited, pendingRequest, refuse } from "../../_lib/respond";

async function handlePOST(req: Request) {
  if (fromAnotherSite(req)) return refuse("origin", 403);
  if (await limited(req, ...SECOND_STEP_LIMIT)) return refuse("locked", 429);

  const request = await pendingRequest(req);
  if (!request) return expired();

  const options = await passkeyAuthenticationOptions();
  await setSignInChallenge(request._id, options.challenge);
  return json({ ok: true, options });
}

export const POST = withRouteErrors(handlePOST);
