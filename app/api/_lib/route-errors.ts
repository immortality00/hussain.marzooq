import { unstable_rethrow } from "next/navigation";
import { noStoreJson } from "@/app/api/_lib/common";

const DATABASE_UNAVAILABLE = new Set([
  "MongoServerSelectionError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
  "MongoTopologyClosedError",
  "MongoNotConnectedError",
  "MongoPoolClearedError",
]);

export function isDatabaseUnavailable(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current instanceof Error && DATABASE_UNAVAILABLE.has(current.name)) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export function routeErrorResponse(error: unknown): Response {
  if (isDatabaseUnavailable(error)) {
    console.error("[api] database unavailable", error);
    return noStoreJson(
      { ok: false, error: "The site's database isn't responding. Try again shortly." },
      { status: 503, headers: { "Retry-After": "10" } },
    );
  }
  console.error("[api] unhandled error", error);
  return noStoreJson({ ok: false, error: "Something went wrong." }, { status: 500 });
}

export function withRouteErrors<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      unstable_rethrow(error);
      return routeErrorResponse(error);
    }
  };
}
