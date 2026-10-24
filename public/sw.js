// Service worker for the private /admin inbox: shows push notifications for
// new chats and opens the right conversation when one is tapped.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // fall through with defaults
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "New message", {
      body: data.body || "",
      icon: "/admin-icon-192.png",
      badge: "/admin-icon-192.png",
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin);
  if (!target.pathname.startsWith("/admin")) return;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const w of windows) {
          if (new URL(w.url).pathname.startsWith("/admin") && "focus" in w) {
            return w.navigate(target.href).then(() => w.focus());
          }
        }
        return self.clients.openWindow(target.href);
      }),
  );
});
