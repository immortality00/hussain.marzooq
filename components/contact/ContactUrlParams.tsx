"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ContactPrefill } from "./types";

/**
 * Hands the form the booking details a link put in the address. It draws nothing and sits in its own Suspense
 * boundary, so the static page draws the form itself and keeps it: with the form inside the boundary, the page was
 * drawn with a placeholder copy that the browser threw away at load, along with anything already typed into it.
 */
export function ContactUrlParams({ onChange }: { onChange: (prefill: ContactPrefill) => void }) {
  const params = useSearchParams();
  const service = params.get("service") ?? "";
  const category = params.get("category") ?? "";
  const context = params.get("context") ?? "";

  useEffect(() => onChange({ service, category, context }), [service, category, context, onChange]);
  return null;
}
