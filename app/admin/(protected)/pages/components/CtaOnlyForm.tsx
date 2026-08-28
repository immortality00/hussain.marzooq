"use client";

import type { CtaOnlySections } from "@/lib/server/page-sections";
import { CtaFields } from "./CtaFields";

export function CtaOnlyForm({
  data,
  onChange,
}: {
  data: CtaOnlySections;
  onChange: (data: CtaOnlySections) => void;
}) {
  return <CtaFields cta={data.stickyCta} onChange={(stickyCta) => onChange({ stickyCta })} />;
}
