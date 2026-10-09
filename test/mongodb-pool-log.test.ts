import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MongoClient } from "mongodb";
import { logPoolConnections } from "@/lib/server/mongodb-pool-log";

const ADDRESS = "ac-shard-00-01.example.mongodb.net:27017";
const at = (ms: number) => new Date(1_000_000 + ms);

let pool: EventEmitter;

beforeEach(() => {
  pool = new EventEmitter();
  logPoolConnections(pool as unknown as MongoClient);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("pooled connection logging", () => {
  it("logs how long each new connection took to become ready", () => {
    pool.emit("connectionCreated", { address: ADDRESS, connectionId: 3, time: at(0) });
    pool.emit("connectionReady", { address: ADDRESS, connectionId: 3, time: at(412), durationMS: 411.6 });

    expect(console.info).toHaveBeenCalledWith(`[mongodb] pool connection #3 to ${ADDRESS} ready in 412 ms`);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("logs a connection that failed while opening, with how long it waited and why", () => {
    pool.emit("connectionCreated", { address: ADDRESS, connectionId: 4, time: at(0) });
    pool.emit("connectionClosed", {
      address: ADDRESS,
      connectionId: 4,
      time: at(30_012),
      reason: "error",
      error: new Error("connection 4 to 1.2.3.4:27017 timed out"),
    });

    expect(console.error).toHaveBeenCalledWith(
      `[mongodb] pool connection #4 to ${ADDRESS} failed after 30012 ms: connection 4 to 1.2.3.4:27017 timed out`,
    );
  });

  it("falls back to the close reason when the driver gives no error", () => {
    pool.emit("connectionCreated", { address: ADDRESS, connectionId: 5, time: at(0) });
    pool.emit("connectionClosed", { address: ADDRESS, connectionId: 5, time: at(20), reason: "poolClosed" });

    expect(console.error).toHaveBeenCalledWith(`[mongodb] pool connection #5 to ${ADDRESS} failed after 20 ms: poolClosed`);
  });

  it("stays quiet when a connection that opened fine is closed later", () => {
    pool.emit("connectionCreated", { address: ADDRESS, connectionId: 6, time: at(0) });
    pool.emit("connectionReady", { address: ADDRESS, connectionId: 6, time: at(300), durationMS: 300 });
    pool.emit("connectionClosed", { address: ADDRESS, connectionId: 6, time: at(600_000), reason: "idle" });

    expect(console.error).not.toHaveBeenCalled();
  });

  it("keeps connections with the same id on different servers apart", () => {
    const other = "ac-shard-00-02.example.mongodb.net:27017";
    pool.emit("connectionCreated", { address: ADDRESS, connectionId: 1, time: at(0) });
    pool.emit("connectionCreated", { address: other, connectionId: 1, time: at(5) });
    pool.emit("connectionReady", { address: ADDRESS, connectionId: 1, time: at(200), durationMS: 200 });
    pool.emit("connectionClosed", { address: other, connectionId: 1, time: at(10_005), reason: "error" });

    expect(console.info).toHaveBeenCalledWith(`[mongodb] pool connection #1 to ${ADDRESS} ready in 200 ms`);
    expect(console.error).toHaveBeenCalledWith(`[mongodb] pool connection #1 to ${other} failed after 10000 ms: error`);
  });
});
