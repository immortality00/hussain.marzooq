import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { connect, close } = vi.hoisted(() => ({ connect: vi.fn(), close: vi.fn(async () => undefined) }));

vi.mock("mongodb", () => ({
  MongoClient: class {
    connect = connect;
    close = close;
  },
}));

const timedOut = () => Promise.reject(new Error("Server selection timed out after 30000 ms"));
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

let now = 1_000_000;

beforeEach(() => {
  vi.resetModules();
  connect.mockReset();
  close.mockClear();
  now = 1_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  globalThis._mongoClientPromise = undefined;
  globalThis._mongoRetryAt = undefined;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  globalThis._mongoClientPromise = undefined;
  globalThis._mongoRetryAt = undefined;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the database connection", () => {
  it("survives a failed first connection with nobody waiting", async () => {
    connect.mockImplementationOnce(timedOut);
    await import("@/lib/mongodb");
    await settle();

    expect(close).toHaveBeenCalledTimes(1);
    expect(globalThis._mongoRetryAt).toBe(now + 30_000);
  });

  it("answers at once from the failure for 30 seconds, then connects again", async () => {
    const client = { db: vi.fn() };
    connect.mockImplementationOnce(timedOut).mockResolvedValueOnce(client);
    const { mongoClient } = await import("@/lib/mongodb");
    await settle();

    now += 29_000;
    await expect(mongoClient()).rejects.toThrow("Server selection timed out");
    expect(connect).toHaveBeenCalledTimes(1);

    now += 1_000;
    await expect(mongoClient()).resolves.toBe(client);
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("never retries during a production build, so a build with no database fails fast", async () => {
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    connect.mockImplementationOnce(timedOut);
    const { mongoClient } = await import("@/lib/mongodb");
    await settle();

    now += 3_600_000;
    await expect(mongoClient()).rejects.toThrow("Server selection timed out");
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("reuses one connection while it is healthy", async () => {
    connect.mockResolvedValue({ db: vi.fn() });
    const { mongoClient } = await import("@/lib/mongodb");
    await Promise.all([mongoClient(), mongoClient(), mongoClient()]);
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
