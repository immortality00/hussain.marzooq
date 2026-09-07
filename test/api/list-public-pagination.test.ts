import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { find, sort, limit, toArray } = vi.hoisted(() => {
  const toArray = vi.fn();
  const limit = vi.fn(() => ({ toArray }));
  const sort = vi.fn(() => ({ limit }));
  const find = vi.fn(() => ({ sort }));
  return { find, sort, limit, toArray };
});

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({ collection: () => ({ find }) }),
}));

vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit: async () => ({ limited: false, count: 1, resetAt: "" }),
}));

import { encodeMediaCursor } from "@/lib/media-cursor";
import { GET } from "@/app/api/media/list-public/route";

const BASE_TIME = Date.parse("2026-09-01T12:00:00.000Z");

function doc(index: number) {
  return {
    _id: new ObjectId(String(index + 1).padStart(24, "0")),
    type: "image",
    title: `Photo ${index + 1}`,
    tags: [],
    categories: ["photography"],
    people: [],
    createdAt: new Date(BASE_TIME - index * 1000),
  };
}

function docs(count: number) {
  return Array.from({ length: count }, (_, index) => doc(index));
}

async function call(query: string) {
  const res = await GET(new Request(`https://hm.test/api/media/list-public${query}`));
  return (await res.json()) as { items: { id: string }[]; nextCursor: string | null };
}

function lastFindQuery() {
  const calls = find.mock.calls as unknown as Record<string, unknown>[][];
  return calls[calls.length - 1][0];
}

function cursorCondition(query: Record<string, unknown>) {
  const conditions = Array.isArray(query.$and) ? (query.$and as Record<string, unknown>[]) : [];

  return conditions.find(
    (condition) =>
      Array.isArray(condition.$or) &&
      "createdAt" in ((condition.$or as Record<string, unknown>[])[0] ?? {})
  );
}

function decodeCursor(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
    createdAt: string;
    id: string;
  };
}

beforeEach(() => {
  toArray.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/media/list-public — page size", () => {
  test("defaults to 24 and always over-fetches by one to detect a next page", async () => {
    await call("?category=photography&mode=image");
    expect(limit).toHaveBeenCalledWith(25);
  });

  test("honours an explicit limit", async () => {
    await call("?category=photography&mode=image&limit=30");
    expect(limit).toHaveBeenCalledWith(31);
  });

  test("clamps the limit to 60 so a client cannot ask for the whole library", async () => {
    await call("?category=photography&mode=image&limit=5000");
    expect(limit).toHaveBeenCalledWith(61);
  });

  test("clamps a non-positive or unparseable limit", async () => {
    await call("?category=photography&mode=image&limit=0");
    expect(limit).toHaveBeenCalledWith(2);

    await call("?category=photography&mode=image&limit=abc");
    expect(limit).toHaveBeenCalledWith(25);
  });

  test("sorts newest first with _id as the tiebreak", async () => {
    await call("?category=photography&mode=image");
    expect(sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
  });
});

describe("GET /api/media/list-public — browse-mode pagination past 60", () => {
  test("returns exactly the requested page and a cursor when more remain", async () => {
    toArray.mockResolvedValue(docs(61));

    const body = await call("?category=photography&mode=image&limit=60");

    expect(body.items).toHaveLength(60);
    expect(body.nextCursor).toBeTruthy();
    expect(decodeCursor(body.nextCursor as string).id).toBe(body.items[59].id);
  });

  test("returns a null cursor on the last page", async () => {
    toArray.mockResolvedValue(docs(42));

    const body = await call("?category=photography&mode=image&limit=60");

    expect(body.items).toHaveLength(42);
    expect(body.nextCursor).toBeNull();
  });

  test("a cursor built from the last item of page 1 fetches item 61 onward", async () => {
    toArray.mockResolvedValue(docs(61));
    const page1 = await call("?category=photography&mode=image&limit=60");

    toArray.mockResolvedValue(docs(61).slice(60).concat(doc(61), doc(62)));
    const page2 = await call(
      `?category=photography&mode=image&limit=60&cursor=${page1.nextCursor}`
    );

    expect(cursorCondition(lastFindQuery())).toBeDefined();
    expect(page2.items[0].id).toBe("000000000000000000000061");
  });

  test("the cursor condition pages strictly past the boundary document", async () => {
    const cursor = encodeMediaCursor({
      createdAt: "2026-09-01T12:00:00.000Z",
      id: "000000000000000000000060",
    });

    await call(`?category=photography&mode=image&limit=60&cursor=${cursor}`);

    const condition = cursorCondition(lastFindQuery()) as { $or: Record<string, unknown>[] };

    expect(condition.$or[0]).toEqual({
      createdAt: { $lt: new Date("2026-09-01T12:00:00.000Z") },
    });
    expect(condition.$or[1]).toEqual({
      createdAt: new Date("2026-09-01T12:00:00.000Z"),
      _id: { $lt: new ObjectId("000000000000000000000060") },
    });
  });
});

describe("GET /api/media/list-public — malformed cursors", () => {
  test.each([
    ["not-base64", "%%%"],
    ["valid base64 that is not JSON", Buffer.from("nope").toString("base64url")],
    [
      "JSON missing fields",
      Buffer.from(JSON.stringify({ createdAt: "2026-09-01T12:00:00.000Z" })).toString("base64url"),
    ],
    [
      "an unparseable date",
      Buffer.from(JSON.stringify({ createdAt: "yesterday", id: "000000000000000000000060" })).toString(
        "base64url"
      ),
    ],
    [
      "a non-ObjectId id",
      Buffer.from(
        JSON.stringify({ createdAt: "2026-09-01T12:00:00.000Z", id: "nope" })
      ).toString("base64url"),
    ],
  ])("ignores %s instead of throwing", async (_label, cursor) => {
    toArray.mockResolvedValue(docs(3));

    const res = await GET(
      new Request(
        `https://hm.test/api/media/list-public?category=photography&mode=image&cursor=${encodeURIComponent(cursor)}`
      )
    );

    expect(res.status).toBe(200);

    expect(cursorCondition(lastFindQuery())).toBeUndefined();
  });
});

describe("GET /api/media/list-public — filters", () => {
  test("scopes to the category and to public items only", async () => {
    await call("?category=photography&mode=image");

    const query = lastFindQuery();
    expect(query).toMatchObject({ categories: "photography", type: "image" });
    expect(query.$or).toEqual([{ isPublic: true }, { isPublic: { $exists: false } }]);
  });

  test("video mode includes embeds", async () => {
    await call("?category=videography&mode=video");

    const conditions = lastFindQuery().$and as Record<string, unknown>[];
    expect(conditions).toContainEqual({ type: { $in: ["video", "embed"] } });
  });

  test("a tag filter is an exact slug match, not a regex", async () => {
    await call("?category=photography&mode=image&tag=exhibitions");

    const conditions = lastFindQuery().$and as Record<string, unknown>[];
    expect(conditions).toContainEqual({ tags: "exhibitions" });
  });

  test("a search query is escaped before becoming a regex", async () => {
    await call("?category=photography&mode=image&q=a.%2Ab");

    const conditions = lastFindQuery().$and as Record<string, unknown>[];
    const search = conditions.find(
      (c) => Array.isArray(c.$or) && "title" in ((c.$or as Record<string, unknown>[])[0] ?? {})
    ) as { $or: Record<string, RegExp>[] };

    expect(search.$or[0].title.source).toBe("a\\.\\*b");
  });
});
