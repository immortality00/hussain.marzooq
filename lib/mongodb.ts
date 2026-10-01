import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

// Reuse the client across hot reloads in development to avoid connection storms
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect() {
  const client = new MongoClient(uri, { maxConnecting: 10 });
  const connecting = client.connect();
  connecting.catch((error: unknown) => {
    console.error("[mongodb] connection failed", error);
    if (global._mongoClientPromise === connecting) global._mongoClientPromise = undefined;
    void client.close().catch(() => {});
  });
  return connecting;
}

export function mongoClient() {
  return (global._mongoClientPromise ??= connect());
}

mongoClient();
