export type BulkFailure = { id: string; message: string };

export function bulkResultText(
  result: { ok: number; failures: BulkFailure[] },
  verb: string,
  labelOf: (id: string) => string,
  fallback = "Failed.",
) {
  const { ok, failures } = result;
  const summary = `${ok} ${verb}${failures.length ? `, ${failures.length} failed` : ""}.`;
  const reasons = failures.map((f) => `“${labelOf(f.id)}”: ${f.message || fallback}`);
  return [summary, ...reasons].join(" ");
}
