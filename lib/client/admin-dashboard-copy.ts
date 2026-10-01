export const DASHBOARD_PATH = "/admin/dashboard";
export const DASHBOARD_COPY_CACHE = "hm-admin-page-v1";
export const SAVE_COPY_HEADER = "x-hm-save-copy";
export const DATA_CHANGED_MESSAGE = "hm-admin-data-changed";
export const NAVIGATE_MESSAGE = "hm-admin-navigate";

export async function keepDashboardCopy() {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  await fetch(DASHBOARD_PATH, { cache: "no-store", headers: { [SAVE_COPY_HEADER]: "1" } });
}
