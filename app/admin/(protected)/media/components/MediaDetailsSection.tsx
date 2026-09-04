"use client";

import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import MediaPeoplePicker from "./MediaPeoplePicker";
import TagMultiSelect from "./TagMultiSelect";

export default function MediaDetailsSection({
  title,
  setTitle,
  year,
  setYear,
  description,
  setDescription,
  selectedLocation,
  setLocationFromOption,
  clearLocation,
  event,
  setEvent,
  selectedTagSlugs,
  addTag,
  removeTag,
  selectedPeopleIds,
  selectedPeopleNames,
  setSelectedPeople,
}: {
  title: string;
  setTitle: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedLocation: LocationOption | null;
  setLocationFromOption: (loc: LocationOption) => void;
  clearLocation: () => void;
  event: string;
  setEvent: (value: string) => void;
  selectedTagSlugs: string[];
  addTag: (slug: string) => void;
  removeTag: (slug: string) => void;
  selectedPeopleIds: string[];
  selectedPeopleNames: string[];
  setSelectedPeople: (next: { ids: string[]; names: string[] }) => void;
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
          <LocationSearch
            selectedLocation={selectedLocation}
            onSelect={setLocationFromOption}
            onClear={clearLocation}
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

        <TagMultiSelect selectedSlugs={selectedTagSlugs} addTag={addTag} removeTag={removeTag} />

        <div className="md:col-span-2">
          <MediaPeoplePicker
            selectedPeopleIds={selectedPeopleIds}
            selectedPeopleNames={selectedPeopleNames}
            setSelectedPeople={setSelectedPeople}
          />
        </div>
      </div>
    </section>
  );
}
