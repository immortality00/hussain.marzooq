"use client";

import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { Appearance } from "../lib/types";
import { appearanceError } from "../lib/utils";
import { adminButtonClasses } from "@/components/admin/AdminButton";

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
        <div>
          <div className="text-sm font-medium">Featured / Exhibitions</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Each entry needs a <span className="font-medium text-foreground">name</span> to save.
            Add a <span className="font-medium text-foreground">location</span> for an exhibition to
            show on the globe.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addAppearance("exhibited")}
            className={adminButtonClasses("default", "md")}
          >
            + Exhibition
          </button>
          <button
            type="button"
            onClick={() => addAppearance("featured")}
            className={adminButtonClasses("default", "md")}
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
            const titleError = appearanceError(a);

            return (
              <div key={idx} className="rounded-2xl border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {a.kind === "exhibited" ? "EXHIBITION" : "FEATURED"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAppearance(idx)}
                    className={adminButtonClasses("danger", "sm")}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">
                      Name / Title <span className="text-red-500">*</span>
                    </span>
                    <input
                      value={a.title}
                      onChange={(e) => updateAppearance(idx, { title: e.target.value })}
                      aria-invalid={titleError ? true : undefined}
                      className={`w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
                        titleError ? "border-red-500/70 focus:ring-red-500" : ""
                      }`}
                      placeholder={a.kind === "exhibited" ? "e.g. Solo Exhibition" : "e.g. Featured in…"}
                    />
                    {titleError ? <span className="block text-xs text-red-500">{titleError}</span> : null}
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Venue (optional)</span>
                    <input
                      value={a.venue}
                      onChange={(e) => updateAppearance(idx, { venue: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Gallery, museum, event…"
                    />
                  </label>

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
                    {needsLocation && a.kind === "exhibited" ? (
                      <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                        Pick a location to place this exhibition on the globe. It still saves without
                        one, but it won&apos;t appear there.
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
