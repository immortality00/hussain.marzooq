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

function compare(value: unknown, bound: unknown) {
  const a = value instanceof Date ? value.getTime() : value;
  const b = bound instanceof Date ? bound.getTime() : bound;
  return a === undefined || a === null ? null : (a as number) - (b as number);
}

function satisfies(value: unknown, cond: unknown): boolean {
  if (cond === null) return value === null || value === undefined;
  if (Array.isArray(value)) return value.some((item) => satisfies(item, cond));
  if (cond instanceof RegExp) return typeof value === "string" && cond.test(value);
  if (cond instanceof ObjectId) return value instanceof ObjectId && value.equals(cond);
  if (cond && typeof cond === "object") {
    const ops = cond as Record<string, unknown>;
    if ("$in" in ops) return (ops.$in as unknown[]).some((option) => satisfies(value, option));
    if ("$nin" in ops) return !(ops.$nin as unknown[]).some((option) => satisfies(value, option));
    if ("$ne" in ops) return !satisfies(value, ops.$ne);
    if ("$gt" in ops) return (compare(value, ops.$gt) ?? -1) > 0;
    if ("$lte" in ops) return (compare(value, ops.$lte) ?? 1) <= 0;
    if ("$exists" in ops) return (value !== undefined) === Boolean(ops.$exists);
  }
  return value === cond;
}

function matches(doc: Doc, filter: Filter): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    if (key === "$or") return (cond as Filter[]).some((option) => matches(doc, option));
    if (key === "$and") return (cond as Filter[]).every((option) => matches(doc, option));
    return satisfies(read(doc, key), cond);
  });
}

type Update = {
  $set?: Doc;
  $setOnInsert?: Doc;
  $inc?: Record<string, number>;
  $unset?: Doc;
  $addToSet?: Doc;
};

function sameValue(a: unknown, b: unknown) {
  return a instanceof ObjectId && b instanceof ObjectId ? a.equals(b) : a === b;
}

function apply(doc: Doc, update: Update) {
  for (const [path, value] of Object.entries(update.$set ?? {})) write(doc, path, value);
  for (const [path, by] of Object.entries(update.$inc ?? {})) write(doc, path, ((read(doc, path) as number) ?? 0) + by);
  for (const path of Object.keys(update.$unset ?? {})) delete doc[path];
  for (const [path, value] of Object.entries(update.$addToSet ?? {})) {
    const list = Array.isArray(read(doc, path)) ? (read(doc, path) as unknown[]) : [];
    write(doc, path, list.some((item) => sameValue(item, value)) ? list : [...list, value]);
  }
}

function seedFrom(filter: Filter) {
  return Object.fromEntries(Object.entries(filter).filter(([key, value]) => !key.startsWith("$") && !isOperator(value)));
}

function isOperator(value: unknown) {
  return Boolean(value) && typeof value === "object" && !(value instanceof ObjectId) && !(value instanceof Date) &&
    Object.keys(value as Doc).some((key) => key.startsWith("$"));
}

function collection(name: string) {
  const docs = () => (memory.collections[name] ??= []);
  const guardWrite = () => {
    if (memory.failWritesTo.has(name)) throw new Error(`${name} write failed`);
  };

  return {
    find: (filter: Filter = {}) => {
      let max = Infinity;
      const cursor = {
        sort: () => cursor,
        project: () => cursor,
        limit: (count: number) => {
          max = count;
          return cursor;
        },
        toArray: async () => docs().filter((doc) => matches(doc, filter)).slice(0, max),
      };
      return cursor;
    },
    findOne: async (filter: Filter = {}) => docs().find((doc) => matches(doc, filter)) ?? null,
    countDocuments: async (filter: Filter = {}) => docs().filter((doc) => matches(doc, filter)).length,
    distinct: async (field: string, filter: Filter = {}) => {
      const values: unknown[] = [];
      for (const doc of docs().filter((entry) => matches(entry, filter))) {
        const value = read(doc, field);
        for (const item of Array.isArray(value) ? value : [value]) {
          if (item !== undefined && !values.some((seen) => sameValue(seen, item))) values.push(item);
        }
      }
      return values;
    },
    updateMany: async (filter: Filter, update: Update) => {
      guardWrite();
      const hits = docs().filter((doc) => matches(doc, filter));
      for (const doc of hits) apply(doc, update);
      return { matchedCount: hits.length, modifiedCount: hits.length };
    },
    insertOne: async (doc: Doc) => {
      guardWrite();
      const insertedId = new ObjectId();
      docs().push({ _id: insertedId, ...doc });
      return { insertedId };
    },
    updateOne: async (filter: Filter, update: Update, options?: { upsert?: boolean }) => {
      guardWrite();
      let doc = docs().find((entry) => matches(entry, filter));
      if (!doc && options?.upsert) {
        doc = { _id: new ObjectId(), ...seedFrom(filter), ...update.$setOnInsert };
        docs().push(doc);
      }
      if (!doc) return { matchedCount: 0, modifiedCount: 0 };
      apply(doc, update);
      return { matchedCount: 1, modifiedCount: 1 };
    },
    findOneAndUpdate: async (
      filter: Filter,
      update: Update,
      options?: { upsert?: boolean; returnDocument?: "before" | "after" }
    ) => {
      guardWrite();
      let doc = docs().find((entry) => matches(entry, filter));
      const before = doc ? structuredClone(doc) : null;
      if (!doc && options?.upsert) {
        doc = { _id: new ObjectId(), ...seedFrom(filter), ...update.$setOnInsert };
        docs().push(doc);
      }
      if (!doc) return null;
      apply(doc, update);
      return options?.returnDocument === "after" ? doc : before;
    },
    findOneAndDelete: async (filter: Filter) => {
      guardWrite();
      const index = docs().findIndex((doc) => matches(doc, filter));
      return index >= 0 ? docs().splice(index, 1)[0]! : null;
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
