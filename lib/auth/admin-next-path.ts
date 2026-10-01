export const ADMIN_HOME_PATH = "/admin/dashboard";

const ORIGIN = "https://admin.invalid";
const NOT_A_DESTINATION = new Set(["/admin", "/admin/", "/admin/logout", "/admin/logout/"]);

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
