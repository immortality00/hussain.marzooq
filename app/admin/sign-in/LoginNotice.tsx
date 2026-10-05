"use client";

import { useEffect, useSyncExternalStore } from "react";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import { hasAdminHint } from "@/lib/client/admin-hint";

const SIGNED_OUT_REASONS: Record<string, string> = {
  expired: "session expired",
  signature: "session no longer valid",
  future: "session no longer valid",
  malformed: "session no longer valid",
  config: "admin is not configured",
};

const subscribeNever = () => () => {};

function useQueryAfterHydration() {
  const search = useSyncExternalStore(subscribeNever, () => location.search, () => null);
  return search === null ? null : new URLSearchParams(search);
}

export function LoginNotice() {
  const params = useQueryAfterHydration();
  const loggedOut = params?.get("loggedout") === "1";
  const signedOut = SIGNED_OUT_REASONS[params?.get("signedout") ?? ""];
  const notice = loggedOut ? "Logged out." : signedOut ? `Signed out: ${signedOut}.` : null;
  const forwardTo = !params || loggedOut || params.has("signedout") ? null : safeAdminNextPath(params.get("next"));

  useEffect(() => {
    if (forwardTo && hasAdminHint()) location.replace(forwardTo);
  }, [forwardTo]);

  return notice ? <div className="mt-6 rounded-2xl border p-4 text-sm text-muted-foreground">{notice}</div> : null;
}

export function NextPathField() {
  const next = useQueryAfterHydration()?.get("next") ?? "";
  return <input type="hidden" name="next" value={next} />;
}
