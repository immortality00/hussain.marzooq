"use client";

import type { CtaCopy, TextCard } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingCardListEditor } from "@/components/admin/page-sections/RepeatingListEditor";

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

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Closing booking bar
        </p>
        <TextField label="Title" value={cta.title} onChange={(v) => onCtaChange({ ...cta, title: v })} />
        <TextAreaField
          label="Description"
          rows={2}
          value={cta.description}
          onChange={(v) => onCtaChange({ ...cta, description: v })}
        />
        <TextField
          label="Button label"
          value={cta.buttonLabel}
          onChange={(v) => onCtaChange({ ...cta, buttonLabel: v })}
        />
      </div>
    </div>
  );
}
