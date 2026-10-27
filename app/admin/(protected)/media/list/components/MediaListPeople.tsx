import { Users } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useMediaOptions } from "../../components/MediaOptionsContext";
import { linkedPeopleOf, personGate } from "../../lib/media-people";

const GATED = "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300";

export function MediaListPeople({ ids, names }: { ids: string[]; names: string[] }) {
  const { people: profiles } = useMediaOptions();
  const people = useMemo(
    () =>
      linkedPeopleOf(ids, names).map((person) => ({
        ...person,
        gate: person.id ? personGate(profiles.find((profile) => profile.id === person.id)) : null,
      })),
    [ids, names, profiles]
  );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Users aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="sr-only">People:</span>
      {people.length ? (
        people.map((person) => (
          <span
            key={person.id || `legacy-${person.name}`}
            className={cn(
              "max-w-full rounded-full border px-2 py-0.5 text-xs wrap-anywhere",
              person.gate ? GATED : "text-muted-foreground"
            )}
          >
            {person.name}
            {person.gate ? ` · ${person.gate}` : ""}
          </span>
        ))
      ) : (
        <span className="text-xs text-muted-foreground">No people</span>
      )}
    </div>
  );
}
