import { ADMIN_BUILD } from "@/lib/admin-data";

// A small admin snapshot and fetch helpers for tests of the phone-side admin store.

type MediaItems = import("@/lib/server/admin-snapshot").AdminSnapshot["media"]["items"];

export function mediaItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `m${i}`, title: `M${i}`, createdAt: null })) as unknown as MediaItems;
}

export function snapshot(inquiryNames: string[], media = 2, build = ADMIN_BUILD) {
  return {
    build,
    dashboard: { stats: { media: { total: 0 }, inquiries: { new: 0, active: 0 } }, missingImage: 0, hidden: 0 },
    notificationCount: inquiryNames.length,
    push: { publicKey: null, devices: [] },
    inquiries: inquiryNames.map((name, i) => ({ id: String(i), name, status: "new", isArchived: false })),
    testimonials: [] as { id: string; isApproved: boolean }[],
    people: [],
    services: [],
    galleries: [],
    blog: { posts: [] as { waiting: boolean }[], forms: {}, categoryOptions: [] },
    removal: { items: [], history: [] },
    pages: { settings: {}, seo: {}, sections: {}, sectionsUpdatedAt: {} },
    media: { items: mediaItems(media), nextCursor: "next", full: {} },
  };
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export const reply = (body: unknown, status = 200) => Promise.resolve(json(body, status));

export function deferred() {
  let resolve: (value: Response) => void = () => {};
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

export const tick = (ms = 2) => new Promise((r) => setTimeout(r, ms));
