/**
 * Service Worker for HabitaPlot PWA
 * Enables offline-first functionality with background sync
 */

const CACHE_VERSION = 'habitaplot-v1.0.0';
const CACHE_NAMES = {
  api: `${CACHE_VERSION}-api`,
  static: `${CACHE_VERSION}-static`,
  images: `${CACHE_VERSION}-images`,
  offline: `${CACHE_VERSION}-offline`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

const API_CACHE_ROUTES = [
  '/api/v1/payments/mobile-money/providers',
  '/api/v1/listings',
  '/api/v1/users/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[SW] Some static assets failed to cache', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !Object.values(CACHE_NAMES).includes(cacheName))
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - offline-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network-first with fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response and cache it
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.api).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            // No cache, return offline page
            return caches.match('/offline.html').catch(() => {
              return new Response('Offline - no cached data available', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          });
        })
    );
    return;
  }

  // Image requests - cache-first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAMES.images).then((cache) => {
              cache.put(request, clonedResponse);
            });
            return response;
          })
          .catch(() => {
            // Return placeholder image
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
      })
    );
    return;
  }

  // HTML/CSS/JS - cache-first, fallback to network
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'document') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAMES.static).then((cache) => {
              cache.put(request, clonedResponse);
            });
            return response;
          })
          .catch(() => {
            return new Response('Offline - resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
    );
    return;
  }
});

// Background Sync for offline transactions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  try {
    const db = await openIndexedDB();
    const pendingTransactions = await getPendingTransactions(db);

    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch('/api/v1/payments/mobile-money/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(transaction)
        });

        if (response.ok) {
          await markTransactionSynced(db, transaction.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync transaction:', error);
      }
    }

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        success: true
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitaPlot', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    };
  });
}

function getPendingTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result.filter((tx) => !tx.synced));
  });
}

function markTransactionSynced(db, transactionId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.get(transactionId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const txn = request.result;
      txn.synced = true;
      store.put(txn);
      resolve();
    };
  });
}
