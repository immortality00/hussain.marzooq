"use client";

import { useEffect } from "react";
import { runAfterAdminData } from "@/lib/client/admin-store";
import { keepDashboardCopy } from "@/lib/client/admin-dashboard-copy";

let refreshedThisLaunch = false;

export function DashboardCopy() {
  useEffect(() => {
    if (refreshedThisLaunch) return;
    refreshedThisLaunch = true;
    void runAfterAdminData(() => keepDashboardCopy(true));
  }, []);

  return null;
}
