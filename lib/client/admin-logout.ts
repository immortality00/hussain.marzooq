import { ADMIN_LOGOUT_PATH, ADMIN_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";
import { DASHBOARD_COPY_CACHE } from "@/lib/client/admin-dashboard-copy";
import { adminWrite, forgetAdminData } from "@/lib/client/admin-store";

const LOGOUT_TIMEOUT_MS = 10_000;
export const LOGGED_OUT_PATH = `${ADMIN_SIGN_IN_PATH}?loggedout=1`;

async function forgetDashboardCopy() {
  if (typeof caches === "undefined") return;
  await caches.delete(DASHBOARD_COPY_CACHE).catch(() => false);
}

export async function logOutAdmin(): Promise<string | null> {
  let res: Response;
  try {
    const init = { method: "POST", cache: "no-store", signal: AbortSignal.timeout(LOGOUT_TIMEOUT_MS) } as const;
    res = await adminWrite(ADMIN_LOGOUT_PATH, init, []);
  } catch {
    return "Could not log out: no connection.";
  }
  if (!res.ok) return `Could not log out (error ${res.status}).`;
  forgetAdminData();
  await forgetDashboardCopy();
  location.replace(LOGGED_OUT_PATH);
  return null;
}
