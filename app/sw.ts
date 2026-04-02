/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Only cache successful responses
const okOnly = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheWillUpdate: async ({ response }: { response: any }) => {
    if (response && response.status === 200) return response;
    return null;
  },
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // --- Forum API: network first, cached for offline reading ---
    {
      matcher: /^\/api\/threads/,
      handler: new NetworkFirst({
        cacheName: "api-threads",
        networkTimeoutSeconds: 10,
        plugins: [okOnly],
      }),
    },
    {
      matcher: /^\/api\/posts/,
      handler: new NetworkFirst({
        cacheName: "api-posts",
        networkTimeoutSeconds: 10,
        plugins: [okOnly],
      }),
    },
    {
      matcher: /^\/api\/forum\/(summary|whats-new)/,
      handler: new NetworkFirst({
        cacheName: "api-forum",
        networkTimeoutSeconds: 10,
        plugins: [okOnly],
      }),
    },
    // --- Public member list: stale while revalidate (changes rarely) ---
    {
      matcher: /^\/api\/members\/public/,
      handler: new StaleWhileRevalidate({
        cacheName: "api-members-public",
      }),
    },
    // --- Static images: cache first ---
    {
      matcher: /\/images\/.+\.(png|jpg|jpeg|gif|webp|svg)$/,
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [okOnly],
      }),
    },
    // --- Google Fonts: cache first ---
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [okOnly],
      }),
    },
    // --- Default Next.js caching for everything else ---
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
