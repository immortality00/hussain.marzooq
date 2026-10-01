export const DASHBOARD_PATH = "/admin/dashboard";
export const DASHBOARD_COPY_CACHE = "hm-admin-page-v1";
export const SAVE_COPY_HEADER = "x-hm-save-copy";
export const DATA_CHANGED_MESSAGE = "hm-admin-data-changed";

async function hasDashboardCopy() {
  try {
    return Boolean(await (await caches.open(DASHBOARD_COPY_CACHE)).match(DASHBOARD_PATH));
  } catch {
    return true;
  }
}

export async function keepDashboardCopy(replace: boolean) {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  if (!replace && (await hasDashboardCopy())) return;
  await fetch(DASHBOARD_PATH, { cache: "no-store", headers: { [SAVE_COPY_HEADER]: "1" } });
}
