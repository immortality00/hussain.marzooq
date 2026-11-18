type ParamsLike = { toString(): string };

// Which screen an admin address shows: the path and its parameters, without the ones the screen keeps its own
// search and filters in (`stable`). Changing those changes what the screen shows, not which screen it is, so
// AdminScreen keeps the screen (and the field being typed in) instead of opening it afresh.
export function adminScreenAddress(pathname: string, params: ParamsLike, stable: readonly string[] = []): string {
  const kept = new URLSearchParams(params.toString());
  for (const key of stable) kept.delete(key);
  return `${pathname}?${kept.toString()}`;
}
