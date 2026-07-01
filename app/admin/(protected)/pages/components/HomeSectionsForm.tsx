"use client";

import type { HomeSections } from "@/lib/server/page-sections";
import { TextField, TextAreaField } from "@/components/admin/page-sections/fields";

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
          Featured work — Photography card
        </p>
        <TextField
          label="Title"
          value={data.featuredWork.photography.title}
          onChange={(v) =>
            onChange({
              ...data,
              featuredWork: {
                ...data.featuredWork,
                photography: { ...data.featuredWork.photography, title: v },
              },
            })
          }
        />
        <TextAreaField
          label="Description"
          rows={2}
          value={data.featuredWork.photography.description}
          onChange={(v) =>
            onChange({
              ...data,
              featuredWork: {
                ...data.featuredWork,
                photography: { ...data.featuredWork.photography, description: v },
              },
            })
          }
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Featured work — Film card
        </p>
        <TextField
          label="Title"
          value={data.featuredWork.film.title}
          onChange={(v) =>
            onChange({
              ...data,
              featuredWork: { ...data.featuredWork, film: { ...data.featuredWork.film, title: v } },
            })
          }
        />
        <TextAreaField
          label="Description"
          rows={2}
          value={data.featuredWork.film.description}
          onChange={(v) =>
            onChange({
              ...data,
              featuredWork: {
                ...data.featuredWork,
                film: { ...data.featuredWork.film, description: v },
              },
            })
          }
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
        <TextField
          label="NFT card title"
          value={data.creativeSystem.nftCardTitle}
          onChange={(v) =>
            onChange({ ...data, creativeSystem: { ...data.creativeSystem, nftCardTitle: v } })
          }
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
          Showreel panel
        </p>
        <TextField
          label="Heading"
          value={data.showreel.heading}
          onChange={(v) => onChange({ ...data, showreel: { heading: v } })}
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
