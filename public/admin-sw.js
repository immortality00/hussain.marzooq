const FALLBACK_URL = "/admin/dashboard";

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
