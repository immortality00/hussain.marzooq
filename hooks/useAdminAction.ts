"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AdminActionFeedbackState,
  type AdminActionFeedbackType,
} from "@/components/admin/action-feedback/AdminActionFeedback";

import { errorMessage } from "@/lib/error-message";

export { errorMessage };

export function useAdminAction(opts?: { autoDismiss?: boolean; initial?: AdminActionFeedbackState }) {
  const [feedback, setFeedback] = useState<AdminActionFeedbackState>(opts?.initial ?? null);
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
    [clearTimer, opts?.autoDismiss, setFeedback],
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
      notify("err", errorMessage(e));
      return null;
    }
  }

  return { feedback, setFeedback, notify, run };
}
