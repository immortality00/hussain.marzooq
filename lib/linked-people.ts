/** A name on a media item, paired with the profile it links to (`id`), or a typed name with none (`legacy`). */
export type LinkedPerson = { id: string; name: string; legacy: boolean };

/** A person shown on a public media item: their name, and their profile's address when visitors can open it. */
export type MediaPerson = { name: string; slug: string | null };

/** A stored list as strings, each entry kept at its index: a media item pairs `people[i]` with `peopleIds[i]`. */
export function storedList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => (typeof entry === "string" ? entry.trim() : entry == null ? "" : String(entry)));
}

export function linkedPeopleOf(ids: string[], names: string[]): LinkedPerson[] {
  const out: LinkedPerson[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i] ?? "";
    const id = ids[i] ?? "";
    if (!name) continue;

    const key = id ? `id:${id}` : `legacy:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ id, name, legacy: !id });
  }

  return out;
}

/** No profile links: every name stays plain (a private gallery, an item with no popup). */
export const NO_PROFILE_LINKS: ReadonlyMap<string, string> = new Map();

/**
 * The people of a stored media item, each with the address of their profile when it is in
 * `slugById` (public profiles only). A typed name with no profile, or a profile visitors
 * can't open, stays a plain name.
 */
export function mediaPeopleOf(doc: Record<string, unknown>, slugById: ReadonlyMap<string, string>): MediaPerson[] {
  return linkedPeopleOf(storedList(doc.peopleIds), storedList(doc.people)).map((person) => ({
    name: person.name,
    slug: (person.id && slugById.get(person.id)) || null,
  }));
}
