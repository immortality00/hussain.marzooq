import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { passkeyAuthenticationOptions } from "@/lib/server/passkeys";
import { findPendingApproval, setApprovalChallenge } from "@/lib/server/sign-in-requests";

export const dynamic = "force-dynamic";

/** The Face ID / Touch ID challenge an approval must answer. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const { id } = await ctx.params;
  const request = await findPendingApproval(id);
  if (!request) return noStoreJson({ ok: false, error: "This sign-in request has expired." }, { status: 404 });

  const options = await passkeyAuthenticationOptions();
  await setApprovalChallenge(request._id, options.challenge);
  return noStoreJson({ ok: true, options });
}
