const CACHE_NAME = 'kambo-strong-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/Header_Logo.webp',
  '/Serving_Kambo.webp',
  '/Kambo-with-chemicals.webp',
  '/imgi_11_main_background.9f85dea.webp',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          if (event.request.url.includes('localhost') || 
              event.request.url.startsWith('/') ||
              event.request.url.includes('Header_Logo') ||
              event.request.url.includes('Serving_Kambo') ||
              event.request.url.includes('Kambo-with-chemicals') ||
              event.request.url.includes('imgi_11_main_background')) {
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Failed to cache response:', error);
              });
          }

          return response;
        }).catch(() => {
          // Offline fallback for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages
  self.clients.claim();
});

// Background sync for form data when online
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any pending form submissions or data sync
  return Promise.resolve();
}

// Push notification handler (optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Kambo Strong',
    icon: '/Header_Logo.webp',
    badge: '/Header_Logo.webp',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/Header_Logo.webp'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/Header_Logo.webp'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Kambo Strong', options)
  );
});
