import type {
  ConnectionClosedEvent,
  ConnectionCreatedEvent,
  ConnectionReadyEvent,
  MongoClient,
} from "mongodb";
import { errorMessage } from "@/lib/error-message";

type PoolConnectionEvent = ConnectionCreatedEvent | ConnectionReadyEvent | ConnectionClosedEvent;

const keyOf = (event: PoolConnectionEvent) => `${event.address}#${event.connectionId}`;
const labelOf = (event: PoolConnectionEvent) => `pool connection #${event.connectionId} to ${event.address}`;

export function logPoolConnections(client: Pick<MongoClient, "on">) {
  const opening = new Map<string, Date>();

  client.on("connectionCreated", (event) => {
    opening.set(keyOf(event), event.time);
  });

  client.on("connectionReady", (event) => {
    opening.delete(keyOf(event));
    console.info(`[mongodb] ${labelOf(event)} ready in ${Math.round(event.durationMS)} ms`);
  });

  client.on("connectionClosed", (event) => {
    const createdAt = opening.get(keyOf(event));
    if (!createdAt) return;
    opening.delete(keyOf(event));
    const cause = errorMessage((event as { error?: unknown }).error, event.reason);
    const elapsed = event.time.getTime() - createdAt.getTime();
    console.error(`[mongodb] ${labelOf(event)} failed after ${elapsed} ms: ${cause}`);
  });
}
