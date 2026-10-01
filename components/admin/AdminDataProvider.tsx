"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadAdminAnalytics, refreshAdminData, runAfterAdminData } from "@/lib/client/admin-store";

export function AdminDataProvider() {
  const pathname = usePathname();

  useEffect(() => {
    void refreshAdminData();
  }, [pathname]);

  useEffect(() => {
    void runAfterAdminData(() => loadAdminAnalytics());
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshAdminData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
