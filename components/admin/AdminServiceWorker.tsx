"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAdminWorker } from "@/lib/client/admin-push-api";
import { DATA_CHANGED_MESSAGE, NAVIGATE_MESSAGE } from "@/lib/client/admin-dashboard-copy";
import { refreshAdminData } from "@/lib/client/admin-store";

function sameOriginPath(url: unknown) {
  if (typeof url !== "string") return null;
  const target = new URL(url, location.origin);
  return target.origin === location.origin ? `${target.pathname}${target.search}` : null;
}

export function AdminServiceWorker() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data === DATA_CHANGED_MESSAGE) void refreshAdminData({ changed: true });
      if (event.data?.type !== NAVIGATE_MESSAGE) return;
      const path = sameOriginPath(event.data.url);
      if (!path) return;
      router.push(path);
      event.ports[0]?.postMessage("navigated");
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    registerAdminWorker()
      .then((registration) => registration.update())
      .catch(() => {});

    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
