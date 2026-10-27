"use client";

import { AdminLink } from "@/components/admin/AdminLink";
import { useMemo, useState } from "react";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { PersonProfileOption } from "../lib/types";
import { linkedPeopleOf, personGate, type LinkedPerson } from "../lib/media-people";
import { useMediaOptions } from "./MediaOptionsContext";
import { adminInputClasses } from "@/components/admin/admin-input";

export default function MediaPeoplePicker({
  selectedPeopleIds,
  selectedPeopleNames,
  setSelectedPeople,
}: {
  selectedPeopleIds: string[];
  selectedPeopleNames: string[];
  setSelectedPeople: (next: { ids: string[]; names: string[] }) => void;
}) {
  const { people: profiles } = useMediaOptions();
  const [peopleQuery, setPeopleQuery] = useState("");

  const selectedPeople = useMemo(
    () => linkedPeopleOf(selectedPeopleIds, selectedPeopleNames),
    [selectedPeopleIds, selectedPeopleNames]
  );

  const gatedSelectedNames = useMemo(() => {
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return selectedPeople
      .filter((person) => person.id && personGate(byId.get(person.id)))
      .map((person) => person.name);
  }, [profiles, selectedPeople]);

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
      next.push({ id: profile.id, name: profile.name, legacy: false });
    }

    setSelectedPeople({
      ids: next.map((p) => p.id),
      names: next.map((p) => p.name),
    });
    setPeopleQuery("");
  }

  function removePerson(target: LinkedPerson) {
    const next = selectedPeople.filter((person) =>
      target.id ? person.id !== target.id : person.name !== target.name
    );

    setSelectedPeople({
      ids: next.filter((p) => p.id).map((p) => p.id),
      names: next.map((p) => p.name),
    });
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">People</label>

      {gatedSelectedNames.length ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-600 dark:text-amber-400">
          {gatedSelectedNames.join(", ")} {gatedSelectedNames.length > 1 ? "are" : "is"} a hidden or
          private profile — this media will be kept private and can’t be made public.
        </p>
      ) : null}

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
          className={adminInputClasses()}
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
              <AdminLink
                href={`/admin/people?create=${encodeURIComponent(peopleQuery.trim())}`}
                className={adminButtonClasses("default", "md")}
              >
                Create new profile
              </AdminLink>
            </div>
          ) : null
        ) : null}
      </div>

      <div className="text-xs text-muted-foreground">
        Only existing people profiles can be linked here.
      </div>
    </div>
  );
}
