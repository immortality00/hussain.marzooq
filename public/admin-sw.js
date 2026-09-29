const FALLBACK_URL = "/admin/dashboard";
const DASHBOARD_PATH = "/admin/dashboard";
const LOGOUT_PATH = "/admin/logout";
const LAUNCH_PATH = "/launch-screen";
const MASK_PATH = "/brand/signature-mask.webp";
const LAUNCH_CACHE = "hm-admin-launch-v1";
const PAGE_CACHE = "hm-admin-page-v1";
const STATIC_CACHE = "hm-admin-static-v1";
const CURRENT_CACHES = [LAUNCH_CACHE, PAGE_CACHE, STATIC_CACHE];
const STATIC_LIMIT = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(LAUNCH_CACHE)
      .then((cache) => cache.addAll([LAUNCH_PATH, MASK_PATH]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("hm-admin-") && !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

async function hasOpenWindow() {
  const windows = await self.clients.matchAll({ type: "window" });
  return windows.length > 0;
}

async function launchScreen(event) {
  const cache = await caches.open(LAUNCH_CACHE);
  const screen = await cache.match(LAUNCH_PATH);
  if (screen) event.waitUntil(cache.add(LAUNCH_PATH).catch(() => {}));
  return screen;
}

function isPage(response) {
  return (
    response.ok &&
    response.type === "basic" &&
    (response.headers.get("content-type") || "").includes("text/html")
  );
}

function fetchDashboard(event) {
  return fetch(event.request).then((response) => {
    if (isPage(response)) {
      const copy = response.clone();
      event.waitUntil(caches.open(PAGE_CACHE).then((cache) => cache.put(DASHBOARD_PATH, copy)));
    } else if (response.type === "opaqueredirect") {
      event.waitUntil(caches.delete(PAGE_CACHE));
    }
    return response;
  });
}

async function dashboard(event) {
  if (!(await hasOpenWindow())) {
    const cached = await (await caches.open(PAGE_CACHE)).match(DASHBOARD_PATH);
    if (cached) {
      event.waitUntil(fetchDashboard(event).catch(() => {}));
      return cached;
    }
    const screen = await launchScreen(event);
    if (screen) return screen;
  }
  return fetchDashboard(event);
}

async function launchScreenOrNetwork(event) {
  if (!(await hasOpenWindow())) {
    const screen = await launchScreen(event);
    if (screen) return screen;
  }
  return fetch(event.request);
}

async function trimStatic(cache) {
  const keys = await cache.keys();
  const extra = keys.length - STATIC_LIMIT;
  if (extra > 0) await Promise.all(keys.slice(0, extra).map((key) => cache.delete(key)));
}

async function staticAsset(event) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(event.request, { ignoreVary: true });
  if (hit) return hit;

  const response = await fetch(event.request);
  if (response.ok && (response.headers.get("cache-control") || "").includes("immutable")) {
    const copy = response.clone();
    event.waitUntil(cache.put(event.request, copy).then(() => trimStatic(cache)));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (request.method === "POST" && url.pathname === LOGOUT_PATH) {
      event.waitUntil(caches.delete(PAGE_CACHE));
    } else if (request.method === "GET" && url.pathname === DASHBOARD_PATH) {
      event.respondWith(dashboard(event));
    } else if (request.method === "GET" && !request.referrer) {
      event.respondWith(launchScreenOrNetwork(event));
    }
    return;
  }

  if (request.method !== "GET") return;
  if (url.pathname === MASK_PATH) {
    event.respondWith(caches.match(MASK_PATH).then((hit) => hit || fetch(request)));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staticAsset(event));
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = typeof data.title === "string" && data.title ? data.title : "Hussain.Art admin";
  const url = typeof data.url === "string" && data.url.startsWith("/") ? data.url : FALLBACK_URL;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: typeof data.body === "string" ? data.body : "",
      icon: "/brand/icon-192.png",
      badge: "/brand/icon-192.png",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data && event.notification.data.url;
  const target = new URL(typeof path === "string" ? path : FALLBACK_URL, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        await client.focus();
        if ("navigate" in client) {
          await client.navigate(target);
        }
        return;
      }
      await self.clients.openWindow(target);
    })()
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  const options = event.oldSubscription && event.oldSubscription.options;
  if (!options) return;

  event.waitUntil(
    (async () => {
      const subscription =
        event.newSubscription || (await self.registration.pushManager.subscribe(options));
      await fetch("/api/admin/push", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), label: "Renewed device" }),
      });
      await fetch("/api/admin/push", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: event.oldSubscription.endpoint }),
      });
    })()
  );
});
