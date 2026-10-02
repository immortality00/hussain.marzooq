export const ADMIN_HOME_PATH = "/admin/dashboard";
export const ADMIN_SIGN_IN_PATH = "/admin/sign-in";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_LOGOUT_PATH = "/admin/logout";

const ORIGIN = "https://admin.invalid";
const NOT_A_DESTINATION = new Set(
  ["/admin", ADMIN_SIGN_IN_PATH, ADMIN_LOGIN_PATH, ADMIN_LOGOUT_PATH].flatMap((path) => [path, `${path}/`])
);

export function safeAdminNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) return ADMIN_HOME_PATH;

  let url: URL;
  try {
    url = new URL(nextPath, ORIGIN);
  } catch {
    return ADMIN_HOME_PATH;
  }

  if (url.origin !== ORIGIN || !url.pathname.startsWith("/admin/")) return ADMIN_HOME_PATH;
  if (NOT_A_DESTINATION.has(url.pathname)) return ADMIN_HOME_PATH;

  return `${url.pathname}${url.search}`;
}

export function adminSignInPath(nextPath: string) {
  return `${ADMIN_SIGN_IN_PATH}?${new URLSearchParams({ next: nextPath })}`;
}
