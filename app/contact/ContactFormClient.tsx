"use client";

import { useSearchParams } from "next/navigation";

export function ContactFormClient() {
  const sp = useSearchParams();
  const success = sp.get("success") === "1";
  const error = sp.get("error") === "1";

  return (
    <>
      {(success || error) && (
        <div
          className={`mt-8 rounded-2xl border p-4 text-sm ${
            success ? "bg-accent/30" : "bg-destructive/10"
          }`}
        >
          {success ? (
            <p>✅ Sent. I’ll get back to you soon.</p>
          ) : (
            <p>
              ⚠️ Please check the form (email must be valid, message must be at
              least 10 characters).
            </p>
          )}
        </div>
      )}
    </>
  );
}
