import type { MongoClientOptions } from "mongodb";

// Relative imports only: bundled into the Netlify functions (db-backup, deploy-succeeded).

/**
 * Every server instance holds its own connections, and Netlify starts one instance per concurrent request.
 * The free cluster allows 500 connections in all; on 2026-11-06 a burst of ~190 page requests started 56
 * instances at once, each opening up to ~16 connections, and Atlas refused them (SystemOverloadedError).
 * Per instance this allows at most 3 working connections to the primary plus 1 monitoring connection per
 * replica-set member (poll mode, instead of stream mode's 2), so 56 instances stay near 340.
 */
export const MAX_POOL_SIZE = 3;

export const POOL_OPTIONS = {
  maxPoolSize: MAX_POOL_SIZE,
  maxConnecting: MAX_POOL_SIZE,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  serverMonitoringMode: "poll",
} satisfies MongoClientOptions;
