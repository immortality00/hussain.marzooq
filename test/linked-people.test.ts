import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mediaPeopleOf, NO_PROFILE_LINKS, storedList } from "@/lib/linked-people";

import { memoryDb, resetMemoryDb } from "@/test/support/memory-db";
import { publicProfileSlugs } from "@/lib/server/public-profile-links";
import { toPublicMediaItems } from "@/lib/server/media-serializers";
import type { Db } from "mongodb";

const db = memoryDb as unknown as Db;
const PUBLIC = new ObjectId();
const NO_FLAG = new ObjectId();
const HIDDEN = new ObjectId();
const LOCKED = new ObjectId();
const NO_SLUG = new ObjectId();

beforeEach(() => {
  resetMemoryDb({
    people_profiles: [
      { _id: PUBLIC, name: "Ana", slug: "ana", isPublic: true, isPrivate: false },
      { _id: NO_FLAG, name: "Bo", slug: "bo" },
      { _id: HIDDEN, name: "Cy", slug: "cy", isPublic: false },
      { _id: LOCKED, name: "Di", slug: "di", isPublic: true, isPrivate: true },
      { _id: NO_SLUG, name: "Ed", slug: "", isPublic: true },
    ],
  });
});

describe("a media item's people", () => {
  test("pair each name with the id at its index and link only the ids given an address", () => {
    const people = mediaPeopleOf(
      { people: ["Ana", "Cy", "Typed Name"], peopleIds: [String(PUBLIC), String(HIDDEN)] },
      new Map([[String(PUBLIC), "ana"]])
    );

    expect(people).toEqual([
      { name: "Ana", slug: "ana" },
      { name: "Cy", slug: null },
      { name: "Typed Name", slug: null },
    ]);
  });

  test("keep their places when an entry is empty, and drop empty names and repeats", () => {
    expect(storedList(["a", "", null, 7])).toEqual(["a", "", "", "7"]);
    const people = mediaPeopleOf(
      { people: ["", "Ana", "Ana"], peopleIds: ["x", String(PUBLIC), String(PUBLIC)] },
      new Map([[String(PUBLIC), "ana"]])
    );
    expect(people).toEqual([{ name: "Ana", slug: "ana" }]);
  });

  test("stay plain names without profile links", () => {
    expect(mediaPeopleOf({ people: ["Ana"], peopleIds: [String(PUBLIC)] }, NO_PROFILE_LINKS)).toEqual([
      { name: "Ana", slug: null },
    ]);
    expect(mediaPeopleOf({}, NO_PROFILE_LINKS)).toEqual([]);
  });
});

describe("public profile addresses", () => {
  test("are found for public profiles only — never a hidden or password-protected one", async () => {
    const slugs = await publicProfileSlugs(db, [
      { peopleIds: [String(PUBLIC), String(HIDDEN)] },
      { peopleIds: [String(LOCKED), String(NO_FLAG), String(NO_SLUG), "not-an-id", "aaaaaaaaaaaa"] },
    ]);

    expect(Object.fromEntries(slugs)).toEqual({ [String(PUBLIC)]: "ana", [String(NO_FLAG)]: "bo" });
  });

  test("need no read when no item links a profile", async () => {
    const collection = vi.spyOn(memoryDb, "collection");
    expect((await publicProfileSlugs(db, [{ people: ["Typed Name"] }])).size).toBe(0);
    expect(collection).not.toHaveBeenCalled();
    collection.mockRestore();
  });

  test("reach the items a page serves", async () => {
    const [item] = await toPublicMediaItems(db, [
      { _id: new ObjectId(), title: "Frame", people: ["Ana", "Di"], peopleIds: [String(PUBLIC), String(LOCKED)] },
    ]);

    expect(item.people).toEqual([
      { name: "Ana", slug: "ana" },
      { name: "Di", slug: null },
    ]);
  });
});
