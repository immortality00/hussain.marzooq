"use client";

import { useCallback, useRef } from "react";
import { errorMessage } from "@/lib/error-message";

type FormKind = "inquiry" | "removal";
type Issued = { token: string; receivedAt: number };

export const FORM_TOKEN_READY_MS = 2700;

async function requestFormToken(form: FormKind): Promise<Issued> {
  const res = await fetch("/api/form-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { token?: unknown; error?: unknown } | null;
  if (res.ok && typeof data?.token === "string") return { token: data.token, receivedAt: Date.now() };
  throw new Error(typeof data?.error === "string" ? data.error : "Reload the page and try again.");
}

export function tokenWaitMs(receivedAt: number, now: number = Date.now()) {
  return Math.max(0, receivedAt + FORM_TOKEN_READY_MS - now);
}

export function useFormToken(form: FormKind) {
  const pending = useRef<Promise<Issued> | null>(null);

  const prime = useCallback(() => {
    if (!pending.current) {
      const request = requestFormToken(form);
      request.catch(() => {
        if (pending.current === request) pending.current = null;
      });
      pending.current = request;
    }
    return pending.current;
  }, [form]);

  const take = useCallback(async (): Promise<{ token: string } | { error: string }> => {
    try {
      const issued = await prime();
      const wait = tokenWaitMs(issued.receivedAt);
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      return { token: issued.token };
    } catch (e) {
      return { error: errorMessage(e, "Reload the page and try again.") };
    }
  }, [prime]);

  const renew = useCallback(() => {
    pending.current = null;
  }, []);

  return { prime, take, renew };
}
