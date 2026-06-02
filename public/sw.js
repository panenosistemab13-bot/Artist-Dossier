self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Become available to all pages
});

self.addEventListener('fetch', (e) => {
  // Fallback to network
});
