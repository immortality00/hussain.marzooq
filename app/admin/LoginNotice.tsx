"use client";

import { useSearchParams } from "next/navigation";

const SIGNED_OUT_REASONS: Record<string, string> = {
  expired: "session expired",
  signature: "session no longer valid",
  future: "session no longer valid",
  malformed: "session no longer valid",
  config: "admin is not configured",
};

const ERROR_CLASSES =
  "mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive";

export function LoginNotice() {
  const params = useSearchParams();
  const error = params.get("error") ?? "";
  const signedOut = SIGNED_OUT_REASONS[params.get("signedout") ?? ""];
  const notice =
    params.get("loggedout") === "1" ? "Logged out." : signedOut ? `Signed out: ${signedOut}.` : null;

  return (
    <>
      {notice ? <div className="mt-6 rounded-2xl border p-4 text-sm text-muted-foreground">{notice}</div> : null}

      {error === "wrong" ? <div className={ERROR_CLASSES}>Wrong password.</div> : null}

      {error === "locked" ? (
        <div className={ERROR_CLASSES}>Too many failed attempts. Please wait before trying again.</div>
      ) : null}

      {error === "config" ? (
        <div className={ERROR_CLASSES}>
          Admin is not configured. Check <code>.env.local</code> for <code>ADMIN_PASSWORD_HASH</code> and{" "}
          <code>ADMIN_COOKIE_SECRET</code>, then restart the dev server.
        </div>
      ) : null}
    </>
  );
}

export function NextPathField() {
  const next = useSearchParams().get("next") ?? "";
  return <input type="hidden" name="next" value={next} />;
}
