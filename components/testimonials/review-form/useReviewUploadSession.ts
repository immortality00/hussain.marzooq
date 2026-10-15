"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CLOUDINARY_TESTIMONIALS_FOLDER } from "@/lib/cloudinary-folders";

type FormToken = { token: string; receivedAt: number };

export function useReviewUploadSession(
  open: boolean,
  hasUploadedFiles: boolean,
  onOpenError: (text: string) => void
) {
  const [formToken, setFormToken] = useState<FormToken | null>(null);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const uploadSessionIdRef = useRef<string | null>(uploadSessionId);
  const committedRef = useRef(false);

  useEffect(() => {
    if (!open || uploadSessionIdRef.current) return;

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/testimonials/upload-session", { method: "POST" });
        const data = (await res.json().catch(() => null)) as {
          sessionId?: string;
          formToken?: string | null;
          error?: string;
        } | null;
        if (cancelled) return;
        if (res.ok && data?.sessionId) {
          setUploadSessionId(data.sessionId);
          setFormToken(data.formToken ? { token: data.formToken, receivedAt: Date.now() } : null);
        } else {
          onOpenError(`The review form could not open: ${data?.error ?? `error ${res.status}`}`);
        }
      } catch {
        if (!cancelled) onOpenError("The review form could not open: no connection.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, onOpenError]);

  useEffect(() => {
    uploadSessionIdRef.current = uploadSessionId;
  }, [uploadSessionId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasUploadedFiles || committedRef.current) return;

      try {
        navigator.sendBeacon("/api/testimonials/upload-session/cleanup");
      } catch {
        // Best-effort cleanup only.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUploadedFiles]);

  const folders = useMemo(
    () => ({
      profilePhoto: uploadSessionId ? `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}/pfp` : "",
      photos: uploadSessionId ? `${CLOUDINARY_TESTIMONIALS_FOLDER}/${uploadSessionId}/photos` : "",
    }),
    [uploadSessionId]
  );

  async function cleanup() {
    if (committedRef.current || !hasUploadedFiles) return;

    try {
      await fetch("/api/testimonials/upload-session/cleanup", { method: "POST" });
    } catch {
      // Best-effort cleanup only.
    }
  }

  function markCommitted() {
    committedRef.current = true;
  }

  function reset() {
    setFormToken(null);
    setUploadSessionId(null);
    committedRef.current = false;
  }

  return { formToken, folders, cleanup, markCommitted, reset };
}
