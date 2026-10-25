"use client";

import { useState } from "react";
import { useFormToken } from "@/hooks/useFormToken";
import type { FormStatusState } from "@/components/shared/FormStatus";

type SubscribeReply = { ok?: boolean; error?: string } | null;

/** `confirmation` is the line shown once the confirmation email is on its way. */
export function useBlogSubscribe(confirmation: string) {
  const formToken = useFormToken("subscribe");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<FormStatusState>(null);
  const fail = (text: string) => setStatus({ type: "err", text: `Not sent: ${text}` });

  async function submit() {
    if (sending) return;
    setStatus(null);
    const value = email.trim();
    if (!value) return fail("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return fail("Email format is invalid.");

    setSending(true);
    try {
      const issued = await formToken.take();
      if ("error" in issued) return fail(issued.error);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, website, formToken: issued.token }),
      });
      const data = (await res.json().catch(() => null)) as SubscribeReply;
      if (!res.ok || !data?.ok) return fail(data?.error ?? `error ${res.status}`);
      formToken.renew();
      setEmail("");
      setStatus({ type: "ok", text: confirmation });
    } catch {
      fail("no connection.");
    } finally {
      setSending(false);
    }
  }

  return { email, setEmail, website, setWebsite, sending, status, submit, prime: formToken.prime };
}
