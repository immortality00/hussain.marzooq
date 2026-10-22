import { ADMIN_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";

const SIGN_IN_REDIRECT_KEY = "hm.admin.signin-redirect";
const SIGN_IN_REDIRECT_GAP_MS = 60_000;
const RELOADED_FOR_KEY = "hm.admin.reloaded-for";

let signedOutReason: string | null = null;

/** Why the server last refused this browser ("revoked" after sign out everywhere), shown on the sign-in page. */
export function noteSignedOutReason(reason: string | null) {
  signedOutReason = reason;
}

export function adminSignInHref() {
  const target = new URL(ADMIN_SIGN_IN_PATH, location.origin);
  target.searchParams.set("next", `${location.pathname}${location.search}`);
  if (signedOutReason) target.searchParams.set("signedout", signedOutReason);
  return target.href;
}

export function redirectedRecently() {
  try {
    const at = Number(sessionStorage.getItem(SIGN_IN_REDIRECT_KEY) ?? 0);
    sessionStorage.setItem(SIGN_IN_REDIRECT_KEY, String(Date.now()));
    return Date.now() - at < SIGN_IN_REDIRECT_GAP_MS;
  } catch {
    return false;
  }
}

export function reloadOnceFor(build: string) {
  try {
    if (sessionStorage.getItem(RELOADED_FOR_KEY) === build) return false;
    sessionStorage.setItem(RELOADED_FOR_KEY, build);
  } catch {
    return false;
  }
  location.reload();
  return true;
}
