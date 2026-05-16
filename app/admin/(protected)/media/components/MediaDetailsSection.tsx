"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PersonProfile = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  isPublic: boolean;
};

function parsePeople(value: string) {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinPeople(values: string[]) {
  return values.join(", ");
}

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
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [peopleQuery, setPeopleQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      try {
        const res = await fetch("/api/people", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: PersonProfile[] };
        if (!cancelled && res.ok && data?.ok && Array.isArray(data.items)) {
          setProfiles(data.items);
        }
      } catch {}
    }

    void loadPeople();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPeople = useMemo(() => parsePeople(peopleText), [peopleText]);

  const availableMatches = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return [];

    return profiles
      .filter((profile) => !selectedPeople.includes(profile.name))
      .filter((profile) => profile.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [peopleQuery, profiles, selectedPeople]);

  const exactMatchExists = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return true;
    return profiles.some((profile) => profile.name.toLowerCase() === q);
  }, [peopleQuery, profiles]);

  function addPerson(name: string) {
    const next = Array.from(new Set([...selectedPeople, name]));
    setPeopleText(joinPeople(next));
    setPeopleQuery("");
  }

  function removePerson(name: string) {
    setPeopleText(joinPeople(selectedPeople.filter((item) => item !== name)));
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

        <div className="space-y-3 md:col-span-2">
          <label className="text-sm font-medium">People</label>

          {selectedPeople.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedPeople.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => removePerson(name)}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
                >
                  {name} ×
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
                      onClick={() => addPerson(profile.name)}
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
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
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