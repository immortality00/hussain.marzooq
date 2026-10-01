import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { connect, close } = vi.hoisted(() => ({ connect: vi.fn(), close: vi.fn(async () => undefined) }));

vi.mock("mongodb", () => ({
  MongoClient: class {
    connect = connect;
    close = close;
  },
}));

beforeEach(() => {
  vi.resetModules();
  connect.mockReset();
  close.mockClear();
  globalThis._mongoClientPromise = undefined;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  globalThis._mongoClientPromise = undefined;
  vi.restoreAllMocks();
});

describe("the database connection", () => {
  it("survives a failed first connection with nobody waiting, and the next request connects again", async () => {
    const client = { db: vi.fn() };
    connect
      .mockImplementationOnce(() => Promise.reject(new Error("Server selection timed out after 30000 ms")))
      .mockResolvedValueOnce(client);

    const { mongoClient } = await import("@/lib/mongodb");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(globalThis._mongoClientPromise).toBeUndefined();
    expect(close).toHaveBeenCalledTimes(1);
    await expect(mongoClient()).resolves.toBe(client);
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("reuses one connection while it is healthy", async () => {
    connect.mockResolvedValue({ db: vi.fn() });
    const { mongoClient } = await import("@/lib/mongodb");
    await Promise.all([mongoClient(), mongoClient(), mongoClient()]);
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
