/**
 * Offline mutation queue using IndexedDB.
 *
 * When the user is offline, failed POST/PATCH mutations are stored here.
 * On reconnect (online event or visibilitychange), the queue is drained.
 * Works on all platforms including iOS Safari which doesn't support Background Sync.
 */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ijf-offline-queue";
const DB_VERSION = 1;
const STORE = "mutations";

export type MutationType = "post-reply" | "create-thread" | "reaction";

export interface QueuedMutation {
  id?: number;
  type: MutationType;
  url: string;
  method: string;
  body: string; // JSON string
  queuedAt: number; // timestamp
  // Human-readable label shown in the UI
  label: string;
}

let db: IDBPDatabase | null = null;

async function getDb() {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
  return db;
}

export async function enqueue(mutation: Omit<QueuedMutation, "id">): Promise<void> {
  const database = await getDb();
  await database.add(STORE, mutation);
}

export async function getAll(): Promise<QueuedMutation[]> {
  const database = await getDb();
  return database.getAll(STORE);
}

export async function remove(id: number): Promise<void> {
  const database = await getDb();
  await database.delete(STORE, id);
}

export async function count(): Promise<number> {
  const database = await getDb();
  return database.count(STORE);
}

/**
 * Drain the queue — attempt to replay every stored mutation in order.
 * Returns the number successfully sent.
 */
export async function drainQueue(): Promise<number> {
  if (!navigator.onLine) return 0;

  const mutations = await getAll();
  if (mutations.length === 0) return 0;

  let sent = 0;
  for (const mutation of mutations) {
    try {
      const res = await fetch(mutation.url, {
        method: mutation.method,
        headers: { "Content-Type": "application/json" },
        body: mutation.body,
      });
      if (res.ok) {
        await remove(mutation.id!);
        sent++;
      }
    } catch {
      // Still offline or server error — leave in queue, try next time
    }
  }
  return sent;
}

/**
 * Call once on app boot to wire up automatic sync triggers.
 * Safe to call multiple times (guards with a flag).
 */
let listenersAttached = false;

export function attachSyncListeners(onDrained?: (sent: number) => void) {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;

  const sync = async () => {
    const sent = await drainQueue();
    if (sent > 0) onDrained?.(sent);
  };

  window.addEventListener("online", sync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      sync();
    }
  });
}
