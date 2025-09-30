// Derivative work from Service Worker boilerplate, MIT License, (c) Chris Ferdinandi.
//
// https://gist.github.com/cferdinandi/0d7937dc333236ba0ee60f1ba9fc0457
// https://gomakethings.com/toolkit/boilerplates/service-worker/
//

//
// Settings & Variables
//

// Version number
let version = '0.1';

// Cache IDs
let coreID = `${version}_core`;
let pageID = `${version}_pages`;
let imgID = `${version}_img`;
let apiID = `${version}_api`;
let cacheIDs = [coreID, pageID, imgID, apiID];

// Max number of files in cache
let limits = {
    pages: 10,
    imgs: 20
};

// Core assets
let coreAssets = [];


//
// Helper Methods
//

/**
 * Remove cached items over a certain number
 * @param  {String}  key The cache key
 * @param  {Integer} max The max number of items allowed
 */
function trimCache(key, max) {
    caches.open(key).then(function (cache) {
        cache.keys().then(function (keys) {
            if (keys.length <= max) return;
            cache.delete(keys[0]).then(function () {
                trimCache(key, max);
            });
        });
    });
}

let maxAgeRegExp = /max-age=(\d+)/;

/**
 * Check if cached API data is still valid
 * @param  {Object}  response The response object
 * @return {Boolean}          If true, cached data is valid
 */
function isValid(response) {
    if (!response) return false;

    let cacheControl = response.headers.get('Cache-Control') || '';
    if (cacheControl === 'no-store') return false;

    let maxAge = cacheControl.match(maxAgeRegExp);
    if (!maxAge) return false;

    let goodFor = parseInt(maxAge[1]) * 1000;
    let fetched = response.headers.get('sw-fetched-on');

    if (fetched && (parseFloat(fetched) + goodFor) > new Date().getTime()) return true;
    return false;
}


// https://www.nngroup.com/articles/website-response-times/
const TEN_SECONDS = 10 * 1000;


function httpGet(url, timeoutInMilliseconds = TEN_SECONDS) {
    let controller = new AbortController();

    return new Promise((reject, resolve) => {
        setTimeout(() => controller.abort(), timeoutInMilliseconds);

        fetch(url, { signal: controller.signal }).then(reject, resolve);
    })
}

//
// Event Listeners
//

// On install, activate immediately
self.addEventListener('install', function (event) {

    // Activate immediately
    self.skipWaiting();

    // Cache core assets
    event.waitUntil(caches.open(coreID).then(function (cache) {
        for (let asset of coreAssets) {
            cache.add(new Request(asset));
        }
        return cache;
    }));

});

// On version update, remove old cached files
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (keys) {

        // Get the keys of the caches to remove
        let keysToRemove = keys.filter(function (key) {
            return !cacheIDs.includes(key);
        });

        // Delete each cache
        let removed = keysToRemove.map(function (key) {
            return caches.delete(key);
        });

        return Promise.all(removed);

    }).then(function () {
        return self.clients.claim();
    }));
});

// Listen for request events
self.addEventListener('fetch', function (event) {

    // Get the request
    let request = event.request;

    // Bug fix
    // https://stackoverflow.com/a/49719964
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

    // HTML files
    // Network-first
    if (request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            httpGet(request).then(function (response) {

                // Create a copy of the response and save it to the cache
                let copy = response.clone();
                event.waitUntil(caches.open(pageID).then(function (cache) {
                    return cache.put(request, copy);
                }));

                // Return the response
                return response;

            }).catch(function (error) {

                // If there's no item in cache, respond with a fallback
                return caches.match(request).then(function (response) {
                    return response || caches.match('/offline.html');
                });

            })
        );
        return;
    }

    // CSS & JavaScript
    // Offline-first
    if (request.headers.get('Accept').includes('text/css') || request.headers.get('Accept').includes('text/javascript')) {
        event.respondWith(
            caches.match(request).then(function (response) {
                return response || httpGet(request).then(function (response) {

                    // Return the response
                    return response;

                });
            })
        );
        return;
    }

    // Images & Fonts
    // Offline-first
    if (request.headers.get('Accept').includes('image') || request.url.includes('your-web-font')) {
        event.respondWith(
            caches.match(request).then(function (response) {
                return response || httpGet(request).then(function (response) {

                    // If the request is for an image, save a copy of it in cache
                    if (request.headers.get('Accept').includes('image')) {
                        let copy = response.clone();
                        event.waitUntil(caches.open(imgID).then(function (cache) {
                            return cache.put(request, copy);
                        }));
                    }

                    // Return the response
                    return response;

                });
            })
        );
        return;
    }

    // API Calls
    // Offline-first
    if (request.url.includes('/api/')) {
        event.respondWith(
            caches.match(request).then(function (response) {

                // If there's a cached API and it's still valid, use it
                let cachedAPI = response;
                if (isValid(response)) {
                    return response;
                }

                // Otherwise, make a fresh API call
                return httpGet(request).then(function (response) {

                    // Create a copy of the response and save it to the cache
                    let copy = response.clone();
                    event.waitUntil(caches.open(apiID).then(function (cache) {
                        let headers = new Headers(copy.headers);
                        headers.append('sw-fetched-on', new Date().getTime());
                        return copy.blob().then(function (body) {
                            return cache.put(request, new Response(body, {
                                status: copy.status,
                                statusText: copy.statusText,
                                headers: headers
                            }));
                        });
                    }));

                    // Return the response
                    return response;

                }).catch(function (error) {
                    return cachedAPI;
                });

            })
        );
        return;
    }

});

// Trim caches over a certain size
self.addEventListener('message', function (event) {

    // Make sure the event was from a trusted site
    if (event.origin !== 'https://your-awesome-website.com'
        && event.origin !== 'http://localhost:5173'
        && event.origin !== 'http://localhost:4173') return;

    // Only run on cleanUp messages
    if (event.data !== 'cleanUp') return;

    // Trim the cache
    trimCache('pages', limits.pages);
    trimCache('img', limits.imgs);

});