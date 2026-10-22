// Calymara: makes the page "cross-origin isolated".
//
// Flutter can then draw in its own render thread instead of the main
// thread – measured on a slowed-down CPU: 60 fps without a single dropped
// frame, instead of 50 fps with a hitch every few frames. That needs two
// response headers which GitHub Pages does not send, so this worker adds
// them. It caches nothing; every request still goes to the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;
  event.respondWith(
    fetch(request).then((response) => {
      // Opaque answers cannot be changed (and are not ours anyway).
      if (response.status === 0) return response;
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    })
  );
});
