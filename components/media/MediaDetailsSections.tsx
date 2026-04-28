"use client";

import type { Appearance, MediaItem } from "./types";
import { formatDates, formatPlace } from "./utils";

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-background/50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function AppearanceBlock({ title, items }: { title: string; items: Appearance[] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      {items.map((a, idx) => (
        <div key={`${title}-${idx}`} className="rounded-2xl border bg-background p-3">
          <div className="text-sm font-medium">{a.title || a.venue || title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatPlace(a)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatDates(a)}</div>
          {a.notes ? <div className="mt-2 text-xs whitespace-pre-wrap leading-relaxed">{a.notes}</div> : null}
          {a.link ? (
            <a
              href={a.link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs underline underline-offset-2"
            >
              Link
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function MediaDetailsSections({ active }: { active: MediaItem }) {
  const exhibitions = (active.appearances ?? []).filter((a) => a.kind === "exhibited");
  const features = (active.appearances ?? []).filter((a) => a.kind === "featured");

  return (
    <div className="space-y-4">
      {active.description ? (
        <Section title="Description">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{active.description}</div>
        </Section>
      ) : null}

      <Section title="Details">
        <div className="flex flex-wrap gap-2">
          {active.year ? <Pill>{String(active.year)}</Pill> : null}
          {active.location ? <Pill>{active.location}</Pill> : null}
          {active.event ? <Pill>{active.event}</Pill> : null}
        </div>
      </Section>

      {active.people?.length ? (
        <Section title="People">
          <div className="flex flex-wrap gap-2">
            {active.people.slice(0, 80).map((p) => (
              <Pill key={p}>{p}</Pill>
            ))}
          </div>
        </Section>
      ) : null}

      {active.categories?.length ? (
        <Section title="Categories">
          <div className="flex flex-wrap gap-2">
            {active.categories.slice(0, 80).map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
        </Section>
      ) : null}

      {active.tags?.length ? (
        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {active.tags.slice(0, 120).map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </Section>
      ) : null}

      {exhibitions.length || features.length ? (
        <Section title="Exhibitions / Featured">
          <div className="space-y-4">
            <AppearanceBlock title="Exhibitions" items={exhibitions} />
            <AppearanceBlock title="Featured" items={features} />
          </div>
        </Section>
      ) : null}
    </div>
  );
}