"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Button } from "@/components/shared/Button";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { CONFIRM_COPY, confirmLink, linkToken, type ConfirmResult } from "./subscribe-confirm";

function onHashChange(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}

/** Confirms the subscription as soon as the page opens from the email; null token until hydrated. */
export function SubscribeConfirm() {
  const token = useSyncExternalStore(onHashChange, () => linkToken(location.hash), () => null);
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    const key = `${token}:${attempt}`;
    if (!token || sentFor.current === key) return;
    sentFor.current = key;
    void confirmLink(token).then(setResult);
  }, [token, attempt]);

  const view = token === "" ? "incomplete" : (result?.view ?? "confirming");
  if (token === null || view === "confirming") return <LoadingScreen className="min-h-72" />;

  const copy = CONFIRM_COPY[view];
  const retry = () => {
    setResult(null);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight wrap-anywhere text-foreground sm:text-6xl">
        <AnimatedText key={view} revealOnLoad>
          {copy.heading}
        </AnimatedText>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
        {view === "retry" && result?.reason ? result.reason : copy.body}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {view === "retry" ? (
          <Button variant="solid" onClick={retry}>
            Try again
          </Button>
        ) : null}
        <Button variant={view === "retry" ? "ghost" : "solid"} href="/blog">
          Back to the blog
        </Button>
      </div>
    </div>
  );
}
