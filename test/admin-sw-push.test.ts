import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const ORIGIN = "https://hussain-marzooq.com";
const SOURCE = readFileSync(join(process.cwd(), "public/admin-sw.js"), "utf8");

type Listener = (event: Record<string, unknown>) => void;

function loadWorker() {
  const listeners: Record<string, Listener> = {};
  const showNotification = vi.fn(async () => undefined);
  const openWindow = vi.fn(async () => null);
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, listener: Listener) => void (listeners[type] = listener),
    registration: { showNotification },
    clients: { matchAll: async () => [], openWindow },
  };
  runInNewContext(SOURCE, { self, URL, console });
  return { listeners, showNotification, openWindow };
}

async function notifiedUrl(url: unknown) {
  const { listeners, showNotification } = loadWorker();
  let pending: Promise<unknown> = Promise.resolve();
  listeners.push({
    data: { json: () => ({ title: "New inquiry", url }) },
    waitUntil: (promise: Promise<unknown>) => void (pending = promise),
  });
  await pending;
  return (showNotification.mock.calls[0] as unknown as [string, { data: { url: string } }])[1].data.url;
}

async function openedTarget(url: unknown) {
  const { listeners, openWindow } = loadWorker();
  let pending: Promise<unknown> = Promise.resolve();
  listeners.notificationclick({
    notification: { close: () => undefined, data: { url } },
    waitUntil: (promise: Promise<unknown>) => void (pending = promise),
  });
  await pending;
  return (openWindow.mock.calls[0] as unknown as [string])[0];
}

describe("admin worker push links", () => {
  it("keeps a same-site path", async () => {
    expect(await notifiedUrl("/admin/inquiries?id=1")).toBe("/admin/inquiries?id=1");
    expect(await openedTarget("/admin/inquiries?id=1")).toBe(`${ORIGIN}/admin/inquiries?id=1`);
  });

  it.each(["//evil.example/x", "/\\evil.example", "/\t/evil.example", "https://evil.example", "admin", 42, null])(
    "falls back to the dashboard for %j",
    async (url) => {
      expect(await notifiedUrl(url)).toBe("/admin/dashboard");
      expect(await openedTarget(url)).toBe(`${ORIGIN}/admin/dashboard`);
    }
  );
});
