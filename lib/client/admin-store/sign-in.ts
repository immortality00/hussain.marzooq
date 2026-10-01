const SIGN_IN_REDIRECT_KEY = "hm.admin.signin-redirect";
const SIGN_IN_REDIRECT_GAP_MS = 60_000;
const RELOADED_FOR_KEY = "hm.admin.reloaded-for";

export function adminSignInHref() {
  const target = new URL("/admin", location.origin);
  target.searchParams.set("next", `${location.pathname}${location.search}`);
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
