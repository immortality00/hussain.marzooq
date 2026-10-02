"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import { hasAdminHint } from "@/lib/client/admin-hint";

const SIGNED_OUT_REASONS: Record<string, string> = {
  expired: "session expired",
  signature: "session no longer valid",
  future: "session no longer valid",
  malformed: "session no longer valid",
  config: "admin is not configured",
};

export function LoginNotice() {
  const params = useSearchParams();
  const loggedOut = params.get("loggedout") === "1";
  const signedOut = SIGNED_OUT_REASONS[params.get("signedout") ?? ""];
  const notice = loggedOut ? "Logged out." : signedOut ? `Signed out: ${signedOut}.` : null;
  const forwardTo = loggedOut || params.has("signedout") ? null : safeAdminNextPath(params.get("next"));

  useEffect(() => {
    if (forwardTo && hasAdminHint()) location.replace(forwardTo);
  }, [forwardTo]);

  return notice ? <div className="mt-6 rounded-2xl border p-4 text-sm text-muted-foreground">{notice}</div> : null;
}

export function NextPathField() {
  const next = useSearchParams().get("next") ?? "";
  return <input type="hidden" name="next" value={next} />;
}
