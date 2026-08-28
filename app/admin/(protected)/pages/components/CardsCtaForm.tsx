"use client";

import type { CtaCopy, TextCard } from "@/lib/server/page-sections";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { CtaFields } from "./CtaFields";

// Shared form for About, Dancing, Web Development, and Blog — all four hold the
// same shape until their design-pass sessions: one card grid and the closing
// booking bar.
export function CardsCtaForm({
  cardsTitle,
  cards,
  cta,
  onCardsChange,
  onCtaChange,
}: {
  cardsTitle: string;
  cards: TextCard[];
  cta: CtaCopy;
  onCardsChange: (cards: TextCard[]) => void;
  onCtaChange: (cta: CtaCopy) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {cardsTitle}
        </p>
        <RepeatingCardListEditor items={cards} onChange={onCardsChange} />
      </div>

      <div className="border-t pt-4">
        <CtaFields cta={cta} onChange={onCtaChange} />
      </div>
    </div>
  );
}
