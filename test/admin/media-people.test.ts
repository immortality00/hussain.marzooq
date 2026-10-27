import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { linkedPeopleOf, personGate } from "@/app/admin/(protected)/media/lib/media-people";
import { MediaListPeople } from "@/app/admin/(protected)/media/list/components/MediaListPeople";
import type { PersonProfileOption } from "@/app/admin/(protected)/media/lib/types";

const profile = (id: string, name: string, flags: Partial<PersonProfileOption> = {}): PersonProfileOption => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  avatarUrl: null,
  isPublic: true,
  isPrivate: false,
  ...flags,
});

const profiles = [
  profile("a", "Jane Doe"),
  profile("b", "Seed Person", { isPublic: false }),
  profile("c", "Ali", { isPrivate: true }),
];

vi.mock("@/app/admin/(protected)/media/components/MediaOptionsContext", () => ({
  useMediaOptions: () => ({ people: profiles, tags: [] }),
}));

const row = (ids: string[], names: string[]) =>
  renderToStaticMarkup(createElement(MediaListPeople, { ids, names }));

describe("linkedPeopleOf", () => {
  it("pairs each name with the id at the same position", () => {
    expect(linkedPeopleOf(["a", "b"], ["Jane Doe", "Seed Person"])).toEqual([
      { id: "a", name: "Jane Doe", legacy: false },
      { id: "b", name: "Seed Person", legacy: false },
    ]);
  });

  it("keeps a name with no id as a legacy entry", () => {
    expect(linkedPeopleOf(["a"], ["Jane Doe", "Old Name"])).toEqual([
      { id: "a", name: "Jane Doe", legacy: false },
      { id: "", name: "Old Name", legacy: true },
    ]);
  });

  it("drops empty names and repeats", () => {
    expect(linkedPeopleOf(["a", "a", ""], ["Jane Doe", "Jane Doe", ""])).toEqual([
      { id: "a", name: "Jane Doe", legacy: false },
    ]);
    expect(linkedPeopleOf([], ["Old", "old"])).toEqual([{ id: "", name: "Old", legacy: true }]);
  });
});

describe("personGate", () => {
  it("names the profile's state, or nothing when it is public", () => {
    expect(personGate(profiles[0])).toBeNull();
    expect(personGate(profiles[1])).toBe("Hidden");
    expect(personGate(profiles[2])).toBe("Password-protected");
    expect(personGate({ isPublic: false, isPrivate: true })).toBe("Hidden");
    expect(personGate(undefined)).toBeNull();
  });
});

describe("MediaListPeople", () => {
  it("shows every linked name, marking gated profiles with their state", () => {
    const html = row(["a", "b", "c"], ["Jane Doe", "Seed Person", "Ali"]);
    expect(html).toContain("People:");
    expect(html).toContain(">Jane Doe</span>");
    expect(html).toContain(">Seed Person · Hidden</span>");
    expect(html).toContain(">Ali · Password-protected</span>");
    expect(html.match(/border-amber-500/g)).toHaveLength(2);
    expect(html).not.toContain("No people");
  });

  it("says No people when nobody is linked", () => {
    expect(row([], [])).toContain(">No people</span>");
  });

  it("shows a name whose profile is not in the list without a marker", () => {
    const html = row(["gone"], ["Someone"]);
    expect(html).toContain(">Someone</span>");
    expect(html).not.toContain("border-amber-500");
  });
});
