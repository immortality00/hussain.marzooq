"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AdminActionFeedbackState,
  type AdminActionFeedbackType,
} from "@/components/admin/action-feedback/AdminActionFeedback";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Action failed.";
}

export function useAdminAction(opts?: { autoDismiss?: boolean }) {
  const [feedback, setFeedback] = useState<AdminActionFeedbackState>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const notify = useCallback(
    (type: AdminActionFeedbackType, text: string) => {
      clearTimer();
      setFeedback({ type, text });
      if (opts?.autoDismiss && type !== "info") {
        const ms = type === "ok" ? 4000 : 7000;
        timerRef.current = window.setTimeout(() => setFeedback(null), ms);
      }
    },
    [clearTimer, opts?.autoDismiss],
  );

  async function run<T>(
    fn: () => Promise<T>,
    runOpts?: { loadingText?: string; successText?: string },
  ): Promise<T | null> {
    if (runOpts?.loadingText) notify("info", runOpts.loadingText);
    else {
      clearTimer();
      setFeedback(null);
    }
    try {
      const result = await fn();
      if (runOpts?.successText) notify("ok", runOpts.successText);
      return result;
    } catch (e) {
      notify("err", getErrorMessage(e));
      return null;
    }
  }

  return { feedback, setFeedback, notify, run };
}
