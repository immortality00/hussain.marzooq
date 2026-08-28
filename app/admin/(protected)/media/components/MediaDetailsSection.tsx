"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LocationSearch } from "@/components/testimonials/review-form/LocationSearch";
import type { LocationOption } from "@/components/testimonials/review-form/types";
import type { PersonProfileOption } from "../lib/types";
import TagMultiSelect from "./TagMultiSelect";
import { adminButtonClasses } from "@/components/admin/AdminButton";

type SelectedPerson = {
  id: string;
  name: string;
  legacy?: boolean;
};

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
  const [profiles, setProfiles] = useState<PersonProfileOption[]>([]);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [peopleError, setPeopleError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      try {
        const res = await fetch("/api/people", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          items?: PersonProfileOption[];
        };

        if (cancelled) return;

        if (res.ok && data?.ok && Array.isArray(data.items)) {
          setProfiles(data.items);
          setPeopleError(false);
        } else {
          setPeopleError(true);
        }
      } catch {
        if (!cancelled) setPeopleError(true);
      }
    }

    void loadPeople();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPeople = useMemo<SelectedPerson[]>(() => {
    const out: SelectedPerson[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < selectedPeopleNames.length; i += 1) {
      const name = selectedPeopleNames[i] ?? "";
      const id = selectedPeopleIds[i] ?? "";

      if (!name) continue;

      const key = id ? `id:${id}` : `legacy:${name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        id,
        name,
        legacy: !id,
      });
    }

    return out;
  }, [selectedPeopleIds, selectedPeopleNames]);

  const availableMatches = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return [];

    const selectedIdSet = new Set(selectedPeople.filter((p) => p.id).map((p) => p.id));

    return profiles
      .filter((profile) => !selectedIdSet.has(profile.id))
      .filter((profile) => profile.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [peopleQuery, profiles, selectedPeople]);

  const exactMatchExists = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return true;
    return profiles.some((profile) => profile.name.toLowerCase() === q);
  }, [peopleQuery, profiles]);

  function addPerson(profile: PersonProfileOption) {
    const next = [...selectedPeople.filter((p) => p.id)];
    if (!next.some((p) => p.id === profile.id)) {
      next.push({ id: profile.id, name: profile.name });
    }

    setSelectedPeople({
      ids: next.map((p) => p.id),
      names: next.map((p) => p.name),
    });
    setPeopleQuery("");
  }

  function removePerson(target: SelectedPerson) {
    const next = selectedPeople.filter((person) =>
      target.id ? person.id !== target.id : person.name !== target.name
    );

    setSelectedPeople({
      ids: next.filter((p) => p.id).map((p) => p.id),
      names: next.map((p) => p.name),
    });
  }

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

        <div className="space-y-3 md:col-span-2">
          <label className="text-sm font-medium">People</label>

          {peopleError && (
            <p className="text-xs text-destructive">
              Could not load the people list — search may be incomplete. Reload the page to retry.
            </p>
          )}

          {selectedPeople.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedPeople.map((person) => (
                <button
                  key={person.id || `legacy-${person.name}`}
                  type="button"
                  onClick={() => removePerson(person)}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
                >
                  {person.name}
                  {person.legacy ? " (legacy)" : ""} ×
                </button>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl border p-3">
            <input
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search existing people profiles..."
            />

            {peopleQuery.trim() ? (
              availableMatches.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableMatches.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => addPerson(profile)}
                      className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                    >
                      {profile.name}
                    </button>
                  ))}
                </div>
              ) : !exactMatchExists ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>No matching profile.</span>
                  <Link
                    href={`/admin/people?create=${encodeURIComponent(peopleQuery.trim())}`}
                    className={adminButtonClasses("default", "md")}
                  >
                    Create new profile
                  </Link>
                </div>
              ) : null
            ) : null}
          </div>

          <div className="text-xs text-muted-foreground">
            Only existing people profiles can be linked here.
          </div>
        </div>
      </div>
    </section>
  );
}