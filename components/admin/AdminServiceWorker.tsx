"use client";

import { useEffect } from "react";
import { registerAdminWorker } from "@/lib/client/admin-push-api";

export function AdminServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    registerAdminWorker()
      .then(async (registration) => {
        await registration.update().catch(() => {});
        (await navigator.serviceWorker.ready).active?.postMessage("save-dashboard");
      })
      .catch(() => {});
  }, []);

  return null;
}
