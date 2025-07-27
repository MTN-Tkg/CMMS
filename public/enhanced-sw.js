const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE_NAME = `cmms-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `cmms-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `cmms-api-${CACHE_VERSION}`;
const OFFLINE_CACHE_NAME = `cmms-offline-${CACHE_VERSION}`;

// Enhanced caching strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/offline.html',
  '/placeholder.svg'
];

// API endpoints configuration
const API_CONFIG = {
  '/api/work-orders': { strategy: CACHE_STRATEGIES.NETWORK_FIRST, ttl: 300000 }, // 5 minutes
  '/api/assets': { strategy: CACHE_STRATEGIES.NETWORK_FIRST, ttl: 600000 }, // 10 minutes
  '/api/parts': { strategy: CACHE_STRATEGIES.NETWORK_FIRST, ttl: 300000 },
  '/api/users': { strategy: CACHE_STRATEGIES.CACHE_FIRST, ttl: 3600000 }, // 1 hour
  '/api/reports': { strategy: CACHE_STRATEGIES.NETWORK_FIRST, ttl: 60000 }, // 1 minute
  '/api/notifications': { strategy: CACHE_STRATEGIES.NETWORK_ONLY, ttl: 0 },
  '/api/sync': { strategy: CACHE_STRATEGIES.NETWORK_ONLY, ttl: 0 },
  '/api/auth': { strategy: CACHE_STRATEGIES.NETWORK_ONLY, ttl: 0 }
};

// Cache size limits
const CACHE_LIMITS = {
  [STATIC_CACHE_NAME]: 100,
  [DYNAMIC_CACHE_NAME]: 200,
  [API_CACHE_NAME]: 500,
  [OFFLINE_CACHE_NAME]: 1000
};

// Background sync tags
const SYNC_TAGS = {
  WORK_ORDERS: 'sync-work-orders',
  ASSETS: 'sync-assets',
  PARTS: 'sync-parts',
  OFFLINE_DATA: 'sync-offline-data',
  INCREMENTAL_UPDATE: 'incremental-update'
};

// Compression utilities
class CompressionUtils {
  static async compress(data) {
    if (typeof data === 'string') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    }
    return data;
  }

  static async decompress(compressedData) {
    if (compressedData instanceof Uint8Array) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(compressedData);
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      return new TextDecoder().decode(decompressed);
    }
    return compressedData;
  }
}

// Enhanced cache management
class CacheManager {
  static async put(cacheName, request, response, options = {}) {
    const cache = await caches.open(cacheName);
    const { compress = false, ttl = 0 } = options;
    
    if (compress && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.text();
      const compressed = await CompressionUtils.compress(data);
      
      const compressedResponse = new Response(compressed, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'x-compressed': 'true',
          'x-cached-at': Date.now().toString(),
          'x-ttl': ttl.toString()
        }
      });
      
      await cache.put(request, compressedResponse);
    } else {
      const responseWithMetadata = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'x-cached-at': Date.now().toString(),
          'x-ttl': ttl.toString()
        }
      });
      
      await cache.put(request, responseWithMetadata);
    }
    
    await this.limitCacheSize(cacheName);
  }

  static async get(cacheName, request) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    
    if (!response) return null;
    
    // Check TTL
    const cachedAt = parseInt(response.headers.get('x-cached-at') || '0');
    const ttl = parseInt(response.headers.get('x-ttl') || '0');
    
    if (ttl > 0 && Date.now() - cachedAt > ttl) {
      await cache.delete(request);
      return null;
    }
    
    // Decompress if needed
    if (response.headers.get('x-compressed') === 'true') {
      const compressedData = new Uint8Array(await response.arrayBuffer());
      const decompressed = await CompressionUtils.decompress(compressedData);
      
      return new Response(decompressed, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(
          [...response.headers.entries()].filter(([key]) => !key.startsWith('x-'))
        )
      });
    }
    
    return response;
  }

  static async limitCacheSize(cacheName) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const limit = CACHE_LIMITS[cacheName] || 100;
    
    if (keys.length > limit) {
      // Remove oldest entries
      const keysToDelete = keys.slice(0, keys.length - limit);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
  }

  static async clearExpiredCache() {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const cachedAt = parseInt(response.headers.get('x-cached-at') || '0');
          const ttl = parseInt(response.headers.get('x-ttl') || '0');
          
          if (ttl > 0 && Date.now() - cachedAt > ttl) {
            await cache.delete(key);
          }
        }
      }
    }
  }
}

// Network status tracking
class NetworkTracker {
  static isOnline = true;
  static lastOnlineTime = Date.now();
  static offlineQueue = [];

  static updateStatus(online) {
    this.isOnline = online;
    if (online) {
      this.lastOnlineTime = Date.now();
      this.processOfflineQueue();
    }
  }

  static addToOfflineQueue(request, data) {
    this.offlineQueue.push({
      request: request.clone(),
      data,
      timestamp: Date.now()
    });
  }

  static async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue.shift();
      try {
        await fetch(item.request, {
          method: 'POST',
          body: JSON.stringify(item.data),
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        // Re-queue if still failing
        this.offlineQueue.unshift(item);
        break;
      }
    }
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Enhanced SW] Install event');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[Enhanced SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Enhanced SW] Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[Enhanced SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Enhanced fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    if (request.method === 'POST' && !NetworkTracker.isOnline) {
      // Queue POST requests when offline
      event.respondWith(
        request.json().then(data => {
          NetworkTracker.addToOfflineQueue(request, data);
          return new Response(JSON.stringify({ queued: true }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    }
    return;
  }
  
  // Handle different request types
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// API request handler with enhanced caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const endpoint = getApiEndpoint(url.pathname);
  const config = API_CONFIG[endpoint] || { strategy: CACHE_STRATEGIES.NETWORK_FIRST, ttl: 300000 };
  
  switch (config.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request, API_CACHE_NAME, config);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request, API_CACHE_NAME, config);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request, API_CACHE_NAME, config);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return handleNetworkOnly(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return handleCacheOnly(request, API_CACHE_NAME);
      
    default:
      return handleNetworkFirst(request, API_CACHE_NAME, config);
  }
}

// Cache-first strategy
async function handleCacheFirst(request, cacheName, config) {
  const cachedResponse = await CacheManager.get(cacheName, request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await CacheManager.put(cacheName, request, networkResponse.clone(), {
        compress: true,
        ttl: config.ttl
      });
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function handleNetworkFirst(request, cacheName, config) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await CacheManager.put(cacheName, request, networkResponse.clone(), {
        compress: true,
        ttl: config.ttl
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Enhanced SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await CacheManager.get(cacheName, request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request, cacheName, config) {
  const cachedResponse = await CacheManager.get(cacheName, request);
  
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        CacheManager.put(cacheName, request, networkResponse.clone(), {
          compress: true,
          ttl: config.ttl
        });
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Network-only strategy
async function handleNetworkOnly(request) {
  return fetch(request);
}

// Cache-only strategy
async function handleCacheOnly(request, cacheName) {
  return CacheManager.get(cacheName, request) || new Response('Not in cache', { status: 404 });
}

// Static asset handler
async function handleStaticAsset(request) {
  return handleCacheFirst(request, STATIC_CACHE_NAME, { ttl: 86400000 }); // 24 hours
}

// Dynamic request handler
async function handleDynamicRequest(request) {
  return handleStaleWhileRevalidate(request, DYNAMIC_CACHE_NAME, { ttl: 3600000 }); // 1 hour
}

// Background sync handler
self.addEventListener('sync', (event) => {
  console.log('[Enhanced SW] Background sync:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.WORK_ORDERS:
      event.waitUntil(syncWorkOrders());
      break;
      
    case SYNC_TAGS.ASSETS:
      event.waitUntil(syncAssets());
      break;
      
    case SYNC_TAGS.PARTS:
      event.waitUntil(syncParts());
      break;
      
    case SYNC_TAGS.OFFLINE_DATA:
      event.waitUntil(syncOfflineData());
      break;
      
    case SYNC_TAGS.INCREMENTAL_UPDATE:
      event.waitUntil(performIncrementalUpdate());
      break;
  }
});

// Sync functions
async function syncWorkOrders() {
  try {
    const offlineData = await getOfflineData('work-orders');
    await syncDataToServer('/api/work-orders', offlineData);
  } catch (error) {
    console.error('[Enhanced SW] Work orders sync failed:', error);
    throw error;
  }
}

async function syncAssets() {
  try {
    const offlineData = await getOfflineData('assets');
    await syncDataToServer('/api/assets', offlineData);
  } catch (error) {
    console.error('[Enhanced SW] Assets sync failed:', error);
    throw error;
  }
}

async function syncParts() {
  try {
    const offlineData = await getOfflineData('parts');
    await syncDataToServer('/api/parts', offlineData);
  } catch (error) {
    console.error('[Enhanced SW] Parts sync failed:', error);
    throw error;
  }
}

async function syncOfflineData() {
  try {
    const dataTypes = ['work-orders', 'assets', 'parts', 'maintenance'];
    
    for (const dataType of dataTypes) {
      const offlineData = await getOfflineData(dataType);
      await syncDataToServer(`/api/${dataType}`, offlineData);
    }
  } catch (error) {
    console.error('[Enhanced SW] Offline data sync failed:', error);
  }
}

// Incremental update system
async function performIncrementalUpdate() {
  try {
    // Get last update timestamp
    const lastUpdate = await getLastUpdateTimestamp();
    
    // Fetch incremental updates
    const response = await fetch(`/api/incremental-updates?since=${lastUpdate}`);
    
    if (response.ok) {
      const updates = await response.json();
      
      // Apply updates to cache
      for (const update of updates) {
        await applyIncrementalUpdate(update);
      }
      
      // Update timestamp
      await setLastUpdateTimestamp(Date.now());
    }
  } catch (error) {
    console.error('[Enhanced SW] Incremental update failed:', error);
  }
}

// Utility functions
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/netlify/functions/');
}

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ico'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || 
         url.pathname.startsWith('/static/') || 
         url.pathname.startsWith('/assets/');
}

function getApiEndpoint(pathname) {
  // Extract base endpoint from pathname
  const parts = pathname.split('/');
  if (parts.length >= 3) {
    return `/${parts[1]}/${parts[2]}`;
  }
  return pathname;
}

// IndexedDB operations
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EnhancedOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result.filter(item => 
          item.id.startsWith(`${storeName}:`) && !item.synced
        );
        resolve(items);
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function syncDataToServer(endpoint, data) {
  for (const item of data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        await markAsSynced(item.id);
      }
    } catch (error) {
      console.error(`[Enhanced SW] Failed to sync item ${item.id}:`, error);
    }
  }
}

async function markAsSynced(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EnhancedOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          item.syncAttempts = 0;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

async function getLastUpdateTimestamp() {
  return new Promise((resolve) => {
    const request = indexedDB.open('EnhancedOfflineDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const getRequest = store.get('lastUpdateTimestamp');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value || 0);
      };
      getRequest.onerror = () => resolve(0);
    };
    request.onerror = () => resolve(0);
  });
}

async function setLastUpdateTimestamp(timestamp) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EnhancedOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const putRequest = store.put({
        key: 'lastUpdateTimestamp',
        value: timestamp,
        timestamp: Date.now()
      });
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

async function applyIncrementalUpdate(update) {
  // Apply update to appropriate cache
  const { type, endpoint, data, operation } = update;
  
  switch (operation) {
    case 'update':
    case 'create':
      const cache = await caches.open(API_CACHE_NAME);
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(endpoint, response);
      break;
      
    case 'delete':
      const deleteCache = await caches.open(API_CACHE_NAME);
      await deleteCache.delete(endpoint);
      break;
  }
}

// Periodic cache cleanup
setInterval(() => {
  CacheManager.clearExpiredCache().catch(error => {
    console.error('[Enhanced SW] Cache cleanup failed:', error);
  });
}, 60 * 60 * 1000); // Every hour

// Network status monitoring
self.addEventListener('online', () => {
  NetworkTracker.updateStatus(true);
});

self.addEventListener('offline', () => {
  NetworkTracker.updateStatus(false);
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[Enhanced SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_VERSION
    });
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  } else if (event.data && event.data.type === 'TRIGGER_SYNC') {
    // Trigger background sync
    self.registration.sync.register(event.data.tag).catch(error => {
      console.error('[Enhanced SW] Sync registration failed:', error);
    });
  }
});

// Cache specific URLs on demand
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  await Promise.all(
    urls.map(url => {
      return fetch(url)
        .then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch(error => {
          console.warn('[Enhanced SW] Failed to cache URL:', url, error);
        });
    })
  );
}

console.log('[Enhanced SW] Enhanced Service Worker loaded and ready');