import { listPasskeys } from "./passkeys";
import { listPendingSignIns } from "./sign-in-requests";

/** The dashboard's Security card and the Approve sign-in screen: passkeys and sign-ins waiting for approval. */
export async function loadAdminSecurity() {
  const [passkeys, signIns] = await Promise.all([listPasskeys(), listPendingSignIns()]);
  return { passkeys, signIns };
}

export type AdminSecurity = Awaited<ReturnType<typeof loadAdminSecurity>>;
