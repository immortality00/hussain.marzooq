import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const RETRY_AFTER_MS = process.env.NEXT_PHASE === "phase-production-build" ? Infinity : 30_000;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

// Reuse the client across hot reloads in development to avoid connection storms
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoRetryAt: number | undefined;
}

function connect() {
  const client = new MongoClient(uri, { maxConnecting: 10 });
  const connecting = client.connect();
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
