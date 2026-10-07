export function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function buildFallback<T>(error: unknown, fallback: T): T {
  if (isBuildPhase()) return fallback;
  throw error;
}
