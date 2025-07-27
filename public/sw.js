const CACHE_NAME = "cmms-mobile-pro-v1.0.0";
const STATIC_CACHE_NAME = "cmms-static-v1.0.0";
const DYNAMIC_CACHE_NAME = "cmms-dynamic-v1.0.0";
const API_CACHE_NAME = "cmms-api-v1.0.0";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/robots.txt",
  "/placeholder.svg",
  // Add more static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  "/api/work-orders",
  "/api/assets",
  "/api/parts",
  "/api/users",
  "/api/reports",
  "/api/notifications",
];

// Network-first routes (always try network first)
const NETWORK_FIRST_ROUTES = ["/api/auth", "/api/sync", "/api/upload"];

// Cache-first routes (static assets)
const CACHE_FIRST_ROUTES = [
  "/static/",
  "/assets/",
  "/icons/",
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".woff",
  ".woff2",
];

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  static: 50,
  dynamic: 100,
  api: 200,
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install event");

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("[ServiceWorker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting(),
    ]),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate event");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      self.clients.claim(),
    ]),
  );
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isCacheFirstRoute(url)) {
    event.respondWith(handleCacheFirst(request));
  } else if (isNetworkFirstRoute(url)) {
    event.respondWith(handleNetworkFirst(request));
  } else {
    event.respondWith(handleStaleWhileRevalidate(request));
  }
});

// Check if request is to API
function isApiRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/netlify/functions/")
  );
}

// Check if route should be cache-first
function isCacheFirstRoute(url) {
  return CACHE_FIRST_ROUTES.some(
    (route) => url.pathname.includes(route) || url.pathname.endsWith(route),
  );
}

// Check if route should be network-first
function isNetworkFirstRoute(url) {
  return NETWORK_FIRST_ROUTES.some((route) => url.pathname.startsWith(route));
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      await limitCacheSize(API_CACHE_NAME, MAX_CACHE_SIZE.api);
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "[ServiceWorker] Network request failed, trying cache:",
      request.url,
    );

    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.destination === "document") {
      return (
        caches.match("/offline.html") ||
        new Response("Offline - Please check your connection", {
          status: 503,
          statusText: "Service Unavailable",
        })
      );
    }

    throw error;
  }
}

// Handle cache-first requests (static assets)
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      await limitCacheSize(STATIC_CACHE_NAME, MAX_CACHE_SIZE.static);
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Cache-first request failed:", request.url);
    throw error;
  }
}

// Handle network-first requests
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log(
      "[ServiceWorker] Network-first request failed, trying cache:",
      request.url,
    );

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Handle stale-while-revalidate requests
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE.dynamic);
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cachedResponse;
    });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Remove oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync:", event.tag);

  if (event.tag === "background-sync-work-orders") {
    event.waitUntil(syncWorkOrders());
  } else if (event.tag === "background-sync-offline-data") {
    event.waitUntil(syncOfflineData());
  }
});

// Sync work orders when online
async function syncWorkOrders() {
  try {
    // Get offline work orders from IndexedDB
    const offlineData = await getOfflineData("work-orders");

    for (const workOrder of offlineData) {
      try {
        await fetch("/api/work-orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workOrder),
        });

        // Remove from offline storage after successful sync
        await removeOfflineData("work-orders", workOrder.id);
      } catch (error) {
        console.error("[ServiceWorker] Failed to sync work order:", error);
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Background sync failed:", error);
    throw error;
  }
}

// Sync all offline data
async function syncOfflineData() {
  try {
    const dataTypes = ["work-orders", "assets", "parts", "maintenance"];

    for (const dataType of dataTypes) {
      const offlineData = await getOfflineData(dataType);

      for (const item of offlineData) {
        try {
          await fetch(`/api/${dataType}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });

          await removeOfflineData(dataType, item.id);
        } catch (error) {
          console.error(`[ServiceWorker] Failed to sync ${dataType}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Offline data sync failed:", error);
  }
}

// IndexedDB operations for offline data
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CMM SOfflineDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CMM SOfflineDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received:", event);

  let notificationData = {
    title: "CMMS Mobile Pro",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    tag: "cmms-notification",
    requireInteraction: false,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-72x72.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData,
    ),
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification clicked:", event);

  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "dismiss") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
    );
  }
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[ServiceWorker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({
      type: "VERSION",
      version: CACHE_NAME,
    });
  } else if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(cacheUrls(event.data.urls));
  }
});

// Cache specific URLs on demand
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  await Promise.all(
    urls.map((url) => {
      return fetch(url)
        .then((response) => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch((error) => {
          console.warn("[ServiceWorker] Failed to cache URL:", url, error);
        });
    }),
  );
}

console.log("[ServiceWorker] Service Worker loaded and ready");
