"use client";

import { createPortal } from "react-dom";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export function SigningIn({ pending }: { pending: boolean }) {
  if (!pending) return null;
  return createPortal(<LoadingScreen className="fixed inset-0 z-50 bg-background" />, document.body);
}

export function LoginError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}
