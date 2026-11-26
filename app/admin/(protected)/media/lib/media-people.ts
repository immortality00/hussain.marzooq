import type { PersonProfileOption } from "./types";

export { linkedPeopleOf, type LinkedPerson } from "@/lib/linked-people";

export type PersonGate = "Hidden" | "Password-protected";

export function personGate(profile: Pick<PersonProfileOption, "isPublic" | "isPrivate"> | undefined): PersonGate | null {
  if (!profile) return null;
  if (profile.isPublic === false) return "Hidden";
  if (profile.isPrivate) return "Password-protected";
  return null;
}
