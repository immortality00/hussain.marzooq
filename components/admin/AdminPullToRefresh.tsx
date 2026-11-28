"use client";

import { useCallback, useState } from "react";
import { PullToRefresh } from "@/components/shared/pull-refresh/PullToRefresh";
import {
  AdminActionFeedback,
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";
import { pullAdminData } from "@/lib/client/admin-store";

/** The admin's pull to refresh, in every browser and its Home Screen app: every screen's data fresh; a failed check says why in the message bar. */
export function AdminPullToRefresh() {
  const [failure, setFailure] = useState<AdminActionFeedbackState>(null);

  const refresh = useCallback(async () => {
    const reason = await pullAdminData();
    setFailure(reason ? { type: "err", text: `Not refreshed: ${reason}` } : null);
    return null;
  }, []);

  return (
    <>
      <PullToRefresh refresh={refresh} />
      <AdminActionFeedback feedback={failure} />
    </>
  );
}
