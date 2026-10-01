"use client";

import { useEffect } from "react";
import { registerAdminWorker } from "@/lib/client/admin-push-api";
import { DATA_CHANGED_MESSAGE } from "@/lib/client/admin-dashboard-copy";
import { refreshAdminData } from "@/lib/client/admin-store";

export function AdminServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data === DATA_CHANGED_MESSAGE) void refreshAdminData({ changed: true });
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    registerAdminWorker()
      .then((registration) => registration.update())
      .catch(() => {});

    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  return null;
}
