// A list screen's search and filters kept in its address (`?q=…&status=…`), so a link can open a filtered view
// and the browser's Back returns to it. Values are kept as typed; an empty one is left out of the address.
export type AddressValues<K extends string> = Record<K, string>;

type ParamsLike = { get(name: string): string | null };

export function readAddressValues<K extends string>(params: ParamsLike, keys: readonly K[]): AddressValues<K> {
  const values = {} as AddressValues<K>;
  for (const key of keys) values[key] = params.get(key) ?? "";
  return values;
}

export function addressValuesKey(values: Record<string, string>): string {
  return JSON.stringify(Object.keys(values).sort().map((key) => [key, values[key]]));
}

// The address's query with these values set (empty ones removed), every other parameter left as it is.
export function withAddressValues(search: string, values: Record<string, string>): string {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

// Safari refuses more than 100 address writes in 30 seconds, and Next.js answers each write with one of its
// own, so writes are at least a second apart: at most 30 in 30 seconds, 60 history calls with Next's.
export const ADDRESS_WRITE_GAP_MS = 1000;

export function addressWriteDelay(lastWriteAt: number | null, now: number): number {
  if (lastWriteAt === null) return 0;
  return Math.max(0, lastWriteAt + ADDRESS_WRITE_GAP_MS - now);
}
