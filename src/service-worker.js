var CACHE_NAME = "pwcamera-v1.0.0";
var urlsToCache = [
	"/",
	"/style.css",
	"/main.js",
	"icons/icon_72.png",
	"icons/icon_96.png",
	"icons/icon_144.png",
	"icons/icon_192.png",
];

self.addEventListener("install", function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

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
		caches.match(event.request).then(function (response) {
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});
