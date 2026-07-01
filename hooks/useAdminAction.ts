"use client";

import { useState } from "react";
import {
  type AdminActionFeedbackState,
} from "@/components/admin/action-feedback/AdminActionFeedback";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Action failed.";
}

export function useAdminAction() {
  const [feedback, setFeedback] = useState<AdminActionFeedbackState>(null);

  async function run<T>(
    fn: () => Promise<T>,
    opts?: { loadingText?: string; successText?: string },
  ): Promise<T | null> {
    setFeedback(opts?.loadingText ? { type: "info", text: opts.loadingText } : null);
    try {
      const result = await fn();
      if (opts?.successText) setFeedback({ type: "ok", text: opts.successText });
      return result;
    } catch (e) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
      return null;
    }
  }

  return { feedback, setFeedback, run };
}
