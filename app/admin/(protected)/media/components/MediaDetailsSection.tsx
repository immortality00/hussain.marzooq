"use client";

export default function MediaDetailsSection({
  title,
  setTitle,
  year,
  setYear,
  description,
  setDescription,
  location,
  setLocation,
  event,
  setEvent,
  tagsText,
  setTagsText,
  peopleText,
  setPeopleText,
}: {
  title: string;
  setTitle: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  event: string;
  setEvent: (value: string) => void;
  tagsText: string;
  setTagsText: (value: string) => void;
  peopleText: string;
  setPeopleText: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Year</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="2026"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Event</label>
          <input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="portrait, fashion, studio"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">People (comma-separated)</label>
          <input
            value={peopleText}
            onChange={(e) => setPeopleText(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="John Doe, Jane Doe"
          />
        </div>
      </div>
    </section>
  );
}