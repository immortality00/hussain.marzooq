import { ObjectId } from "mongodb";

type Doc = Record<string, unknown>;
type Filter = Record<string, unknown>;

export const memory: { collections: Record<string, Doc[]>; failWritesTo: Set<string> } = {
  collections: {},
  failWritesTo: new Set(),
};

export function resetMemoryDb(seed: Record<string, Doc[]> = {}) {
  memory.collections = seed;
  memory.failWritesTo = new Set();
}

function read(doc: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, key) => (node && typeof node === "object" ? (node as Doc)[key] : undefined), doc);
}

function write(doc: Doc, path: string, value: unknown) {
  const keys = path.split(".");
  let node = doc;
  for (const key of keys.slice(0, -1)) {
    if (!node[key] || typeof node[key] !== "object") node[key] = {};
    node = node[key] as Doc;
  }
  node[keys[keys.length - 1]!] = value;
}

function satisfies(value: unknown, cond: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => satisfies(item, cond));
  if (cond instanceof RegExp) return typeof value === "string" && cond.test(value);
  if (cond instanceof ObjectId) return value instanceof ObjectId && value.equals(cond);
  if (cond && typeof cond === "object") {
    const ops = cond as Record<string, unknown>;
    if ("$in" in ops) return (ops.$in as unknown[]).some((option) => satisfies(value, option));
    if ("$ne" in ops) return !satisfies(value, ops.$ne);
  }
  return value === cond;
}

function matches(doc: Doc, filter: Filter): boolean {
  return Object.entries(filter).every(([key, cond]) =>
    key === "$or" ? (cond as Filter[]).some((option) => matches(doc, option)) : satisfies(read(doc, key), cond)
  );
}

function collection(name: string) {
  const docs = () => (memory.collections[name] ??= []);
  const guardWrite = () => {
    if (memory.failWritesTo.has(name)) throw new Error(`${name} write failed`);
  };

  return {
    find: (filter: Filter = {}) => ({ toArray: async () => docs().filter((doc) => matches(doc, filter)) }),
    findOne: async (filter: Filter = {}) => docs().find((doc) => matches(doc, filter)) ?? null,
    insertOne: async (doc: Doc) => {
      guardWrite();
      const insertedId = new ObjectId();
      docs().push({ _id: insertedId, ...doc });
      return { insertedId };
    },
    updateOne: async (filter: Filter, update: { $set?: Doc }) => {
      guardWrite();
      const doc = docs().find((entry) => matches(entry, filter));
      if (!doc) return { matchedCount: 0 };
      for (const [path, value] of Object.entries(update.$set ?? {})) write(doc, path, value);
      return { matchedCount: 1 };
    },
    deleteOne: async (filter: Filter) => {
      guardWrite();
      const index = docs().findIndex((doc) => matches(doc, filter));
      if (index >= 0) docs().splice(index, 1);
      return { deletedCount: index >= 0 ? 1 : 0 };
    },
  };
}

export const memoryDb = { collection };
