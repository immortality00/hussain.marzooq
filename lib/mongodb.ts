import { MongoClient } from "mongodb";
import { isBuildPhase } from "@/lib/server/public-read";
import { logPoolConnections } from "@/lib/server/mongodb-pool-log";

const uri = process.env.MONGODB_URI ?? "";
const SERVER_SELECTION_TIMEOUT_MS = 10_000;
const RETRY_AFTER_MS = isBuildPhase() ? Infinity : 10_000;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

// Reuse the client across hot reloads in development to avoid connection storms
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoRetryAt: number | undefined;
}

function connect() {
  const client = new MongoClient(uri, {
    maxConnecting: 10,
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
  });
  logPoolConnections(client);
  const startedAt = Date.now();
  const connecting = client.connect();
  connecting.then(
    () => console.info(`[mongodb] connected in ${Date.now() - startedAt} ms`),
    () => {},
  );
  connecting.catch((error: unknown) => {
    console.error("[mongodb] connection failed", error);
    if (global._mongoClientPromise === connecting) global._mongoRetryAt = Date.now() + RETRY_AFTER_MS;
    void client.close().catch(() => {});
  });
  return connecting;
}

export function mongoClient() {
  if (global._mongoRetryAt !== undefined && Date.now() >= global._mongoRetryAt) {
    global._mongoClientPromise = undefined;
    global._mongoRetryAt = undefined;
  }
  return (global._mongoClientPromise ??= connect());
}

mongoClient();
