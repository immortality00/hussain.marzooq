"use client";

import { useActionState } from "react";
import { useFormToken } from "@/hooks/useFormToken";
import type { FormStatusState } from "@/components/shared/FormStatus";

type SubscribeReply = { ok?: boolean; error?: string } | null;
type SubscribeState = { status: FormStatusState; email: string };

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * `confirmation` is the line shown once the confirmation email is on its way.
 * The form submits through a React action, so a tap before the page has loaded is held by React's inline script and
 * sent once it has, read from the fields themselves. React clears the form after every send; `email` is what the
 * field holds afterwards — the typed address after a failure, empty after a success.
 */
export function useBlogSubscribe(confirmation: string) {
  const formToken = useFormToken("subscribe");

  async function send(_previous: SubscribeState, data: FormData): Promise<SubscribeState> {
    const typed = field(data, "email");
    const fail = (text: string): SubscribeState => ({ status: { type: "err", text: `Not sent: ${text}` }, email: typed });
    const email = typed.trim();
    if (!email) return fail("Email is required.");
    if (!EMAIL_FORMAT.test(email)) return fail("Email format is invalid.");

    try {
      const issued = await formToken.take();
      if ("error" in issued) return fail(issued.error);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: field(data, "website"), formToken: issued.token }),
      });
      const reply = (await res.json().catch(() => null)) as SubscribeReply;
      if (!res.ok || !reply?.ok) return fail(reply?.error ?? `error ${res.status}`);
      formToken.renew();
      return { status: { type: "ok", text: confirmation }, email: "" };
    } catch {
      return fail("no connection.");
    }
  }

  const [state, action, sending] = useActionState(send, { status: null, email: "" });
  return { action, sending, status: state.status, email: state.email, prime: formToken.prime };
}
