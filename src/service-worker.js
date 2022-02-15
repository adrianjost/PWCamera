const CACHE_NAME = "pwcamera-v1.0.3";

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (CACHE_NAME !== cacheName) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", function (event) {
	event.respondWith(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.match(event.request).then(function (response) {
				return (
					response ||
					fetch(event.request).then(function (response) {
						cache.put(event.request, response.clone());
						return response;
					})
				);
			});
		})
	);
});
