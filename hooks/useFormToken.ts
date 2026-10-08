"use client";

import { useCallback, useRef } from "react";
import { errorMessage } from "@/lib/error-message";

type FormKind = "inquiry" | "removal";

async function requestFormToken(form: FormKind): Promise<string> {
  const res = await fetch("/api/form-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { token?: unknown; error?: unknown } | null;
  if (res.ok && typeof data?.token === "string") return data.token;
  throw new Error(typeof data?.error === "string" ? data.error : "Reload the page and try again.");
}

export function useFormToken(form: FormKind) {
  const pending = useRef<Promise<string> | null>(null);

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
      return { token: await prime() };
    } catch (e) {
      return { error: errorMessage(e, "Reload the page and try again.") };
    }
  }, [prime]);

  const renew = useCallback(() => {
    pending.current = null;
  }, []);

  return { prime, take, renew };
}
