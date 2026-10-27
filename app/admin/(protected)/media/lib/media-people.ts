import type { PersonProfileOption } from "./types";

export type LinkedPerson = { id: string; name: string; legacy: boolean };
export type PersonGate = "Hidden" | "Password-protected";

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

export function personGate(profile: Pick<PersonProfileOption, "isPublic" | "isPrivate"> | undefined): PersonGate | null {
  if (!profile) return null;
  if (profile.isPublic === false) return "Hidden";
  if (profile.isPrivate) return "Password-protected";
  return null;
}
