"use client";

import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { Appearance } from "../lib/types";

function splitLocationLabel(label: string): { city: string; country: string } {
  const trimmed = label.trim();
  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) return { city: trimmed, country: "" };
  return {
    city: trimmed.slice(0, commaIndex).trim(),
    country: trimmed.slice(commaIndex + 1).trim(),
  };
}

function appearanceLocation(a: Appearance): LocationOption | null {
  if (a.locationId === null || a.lat === null || a.lon === null) return null;
  return {
    id: a.locationId,
    label: [a.city, a.country].filter(Boolean).join(", "),
    lat: a.lat,
    lon: a.lon,
    countryCode: null,
    population: null,
    source: "dataset",
  };
}

export default function MediaAppearancesSection({
  appearances,
  addAppearance,
  updateAppearance,
  removeAppearance,
}: {
  appearances: Appearance[];
  addAppearance: (kind: "featured" | "exhibited") => void;
  updateAppearance: (idx: number, patch: Partial<Appearance>) => void;
  removeAppearance: (idx: number) => void;
}) {
  return (
    <section className="rounded-3xl border p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium">Featured / Exhibitions</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addAppearance("exhibited")}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
          >
            + Exhibition
          </button>
          <button
            type="button"
            onClick={() => addAppearance("featured")}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
          >
            + Feature
          </button>
        </div>
      </div>

      {appearances.length === 0 ? (
        <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No entries yet.</div>
      ) : (
        <div className="space-y-3">
          {appearances.map((a, idx) => {
            const needsLocation = a.lat === null || a.lon === null;

            return (
              <div key={idx} className="rounded-2xl border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {a.kind === "exhibited" ? "EXHIBITION" : "FEATURED"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAppearance(idx)}
                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={a.title}
                    onChange={(e) => updateAppearance(idx, { title: e.target.value })}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Title"
                  />
                  <input
                    value={a.venue}
                    onChange={(e) => updateAppearance(idx, { venue: e.target.value })}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Venue"
                  />

                  <div className="md:col-span-2">
                    <LocationSearch
                      selectedLocation={appearanceLocation(a)}
                      onSelect={(loc) => {
                        const { city, country } = splitLocationLabel(loc.label);
                        updateAppearance(idx, {
                          locationId: loc.id,
                          lat: loc.lat,
                          lon: loc.lon,
                          city,
                          country,
                        });
                      }}
                      onClear={() =>
                        updateAppearance(idx, {
                          locationId: null,
                          lat: null,
                          lon: null,
                          city: "",
                          country: "",
                        })
                      }
                    />
                    {needsLocation ? (
                      <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                        No resolved location — this entry will not appear on the globe.
                      </p>
                    ) : null}
                  </div>

                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">From (month &amp; year)</span>
                    <input
                      type="month"
                      value={a.dateFrom}
                      onChange={(e) => updateAppearance(idx, { dateFrom: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">To (month &amp; year)</span>
                    <input
                      type="month"
                      value={a.dateTo}
                      onChange={(e) => updateAppearance(idx, { dateTo: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <input
                    value={a.link}
                    onChange={(e) => updateAppearance(idx, { link: e.target.value })}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
                    placeholder="Link (optional)"
                  />
                  <textarea
                    value={a.notes}
                    onChange={(e) => updateAppearance(idx, { notes: e.target.value })}
                    className="h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
                    placeholder="Notes"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
