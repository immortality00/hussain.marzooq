"use client";

import type { Appearance } from "../lib/types";

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
          {appearances.map((a, idx) => (
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
                <input
                  value={a.city}
                  onChange={(e) => updateAppearance(idx, { city: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="City"
                />
                <input
                  value={a.country}
                  onChange={(e) => updateAppearance(idx, { country: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Country"
                />
                <input
                  value={a.dateFrom}
                  onChange={(e) => updateAppearance(idx, { dateFrom: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Date from"
                />
                <input
                  value={a.dateTo}
                  onChange={(e) => updateAppearance(idx, { dateTo: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Date to"
                />
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
          ))}
        </div>
      )}
    </section>
  );
}