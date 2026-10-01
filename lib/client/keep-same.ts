type Plain = Record<string, unknown>;

const isPlain = (value: unknown): value is Plain =>
  typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;

const idOf = (value: unknown) => (isPlain(value) && typeof value.id === "string" ? value.id : null);

function keepSameArray(next: unknown[], previous: unknown[]) {
  const byId = new Map(previous.map((item) => [idOf(item), item]));
  const out = next.map((item, index) => {
    const id = idOf(item);
    return keepSame(item, id === null ? previous[index] : byId.get(id));
  });
  const same = out.length === previous.length && out.every((item, index) => item === previous[index]);
  return same ? previous : out;
}

function keepSameObject(next: Plain, previous: Plain) {
  const out: Plain = {};
  let same = Object.keys(next).length === Object.keys(previous).length;
  for (const key of Object.keys(next)) {
    out[key] = keepSame(next[key], previous[key]);
    if (out[key] !== previous[key]) same = false;
  }
  return same ? previous : out;
}

export function keepSame<T>(next: T, previous: unknown): T {
  if (Object.is(next, previous)) return next;
  if (Array.isArray(next) && Array.isArray(previous)) return keepSameArray(next, previous) as T;
  if (isPlain(next) && isPlain(previous)) return keepSameObject(next, previous) as T;
  return next;
}
