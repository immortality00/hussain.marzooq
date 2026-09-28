"use client";

import type { HomeSections } from "@/lib/server/page-sections";
import type { FeaturedCard, FeaturedCardSlug } from "@/lib/page-sections-shared";
import { EMPTY_SECTION_IMAGE } from "@/lib/page-sections-shared";
import { DISCIPLINES } from "@/lib/disciplines";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";
import { RepeatingListEditor } from "@/components/admin/page-sections/RepeatingListEditor";
import { ImageField } from "@/components/admin/media-picker/ImageField";
import { CardImageWarning } from "./CardImageWarning";
import { adminInputClasses } from "@/components/admin/admin-input";

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
        className={adminInputClasses()}
      >
        {DISCIPLINES.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={card.title}
        onChange={(e) => onChange({ ...card, title: e.target.value })}
        placeholder="Title"
        className={adminInputClasses("md", "font-medium")}
      />
      <textarea
        rows={2}
        value={card.description}
        onChange={(e) => onChange({ ...card, description: e.target.value })}
        placeholder="Description (optional)"
        className={adminInputClasses()}
      />
      {!card.image.url && (
        <CardImageWarning message="No image — this card renders as a blank panel on the homepage." />
      )}
      <ImageField
        label="Card image"
        value={card.image}
        onChange={(image) => onChange({ ...card, image })}
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
          Hero background image
        </p>
        {!data.hero?.image?.url && (
          <CardImageWarning message="No image — the homepage hero renders without a background photo." />
        )}
        <ImageField
          value={data.hero?.image}
          onChange={(image) => onChange({ ...data, hero: { image } })}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Featured work cards
        </p>
        <p className="text-xs text-muted-foreground">
          Each card links to its discipline page and shows the card image you set below — leave it
          empty for no image. Cards for pages turned off under Visibility are hidden automatically.
        </p>
        <RepeatingListEditor
          items={data.featuredCards}
          onChange={(cards) => onChange({ ...data, featuredCards: cards })}
          makeNew={(): FeaturedCard => ({
            slug: "photography",
            title: "",
            description: "",
            image: EMPTY_SECTION_IMAGE,
          })}
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
        <ImageField
          label="Panel image"
          value={data.creativeSystem.image}
          onChange={(image) => onChange({ ...data, creativeSystem: { ...data.creativeSystem, image } })}
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
        <p className="text-xs text-muted-foreground">
          Cards below the heading show each service&apos;s own image, uploaded in the Services admin.
        </p>
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
