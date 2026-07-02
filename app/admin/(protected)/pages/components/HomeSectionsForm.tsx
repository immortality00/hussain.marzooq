"use client";

import type { HomeSections } from "@/lib/server/page-sections";
import type { FeaturedCard, FeaturedCardSlug } from "@/lib/page-sections-shared";
import { FEATURED_CARD_SLUGS } from "@/lib/page-sections-shared";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";

const SLUG_LABELS: Record<FeaturedCardSlug, string> = {
  photography: "Photography",
  videography: "Videography",
  nft: "NFT",
  dancing: "Dancing",
  "web-development": "Web Development",
};

function FeaturedCardFields({
  card,
  onChange,
}: {
  card: FeaturedCard;
  onChange: (card: FeaturedCard) => void;
}) {
  return (
    <>
      <select
        value={card.slug}
        onChange={(e) => onChange({ ...card, slug: e.target.value as FeaturedCardSlug })}
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {FEATURED_CARD_SLUGS.map((slug) => (
          <option key={slug} value={slug}>
            {SLUG_LABELS[slug]}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={card.title}
        onChange={(e) => onChange({ ...card, title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <textarea
        rows={2}
        value={card.description}
        onChange={(e) => onChange({ ...card, description: e.target.value })}
        placeholder="Description (optional)"
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </>
  );
}

export function HomeSectionsForm({
  data,
  onChange,
}: {
  data: HomeSections;
  onChange: (data: HomeSections) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Featured work cards
        </p>
        <p className="text-xs text-muted-foreground">
          Each card links to its discipline page and pulls that discipline’s latest image. Cards
          for pages turned off under Visibility are hidden automatically.
        </p>
        <RepeatingListEditor
          items={data.featuredCards}
          onChange={(cards) => onChange({ ...data, featuredCards: cards })}
          makeNew={(): FeaturedCard => ({ slug: "photography", title: "", description: "" })}
          renderFields={(card, onItemChange) => (
            <FeaturedCardFields card={card} onChange={onItemChange} />
          )}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Creative system panel
        </p>
        <TextField
          label="Heading"
          value={data.creativeSystem.heading}
          onChange={(v) => onChange({ ...data, creativeSystem: { ...data.creativeSystem, heading: v } })}
        />
        <TextAreaField
          label="Paragraph"
          rows={2}
          value={data.creativeSystem.paragraph}
          onChange={(v) => onChange({ ...data, creativeSystem: { ...data.creativeSystem, paragraph: v } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Services preview
        </p>
        <TextField
          label="Heading"
          value={data.servicesPreview.heading}
          onChange={(v) => onChange({ ...data, servicesPreview: { heading: v } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Trust panel
        </p>
        <TextField
          label="Heading"
          value={data.trust.heading}
          onChange={(v) => onChange({ ...data, trust: { ...data.trust, heading: v } })}
        />
        <TextAreaField
          label="Fallback paragraph (shown when there is no testimonial yet)"
          rows={2}
          value={data.trust.fallbackParagraph}
          onChange={(v) => onChange({ ...data, trust: { ...data.trust, fallbackParagraph: v } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Closing booking bar
        </p>
        <TextField
          label="Title"
          value={data.stickyCta.title}
          onChange={(v) => onChange({ ...data, stickyCta: { ...data.stickyCta, title: v } })}
        />
        <TextAreaField
          label="Description"
          rows={2}
          value={data.stickyCta.description}
          onChange={(v) => onChange({ ...data, stickyCta: { ...data.stickyCta, description: v } })}
        />
        <TextField
          label="Button label"
          value={data.stickyCta.buttonLabel}
          onChange={(v) => onChange({ ...data, stickyCta: { ...data.stickyCta, buttonLabel: v } })}
        />
      </div>
    </div>
  );
}
