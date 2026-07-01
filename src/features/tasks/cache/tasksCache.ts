import type { TasksPage } from "../types";

const DB_NAME = "activity-console";
const STORE_NAME = "task-cache";
const CACHE_KEY = "latest-task-page";
const DB_VERSION = 1;

export interface CachedTasksPage extends TasksPage {
  cachedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = run(transaction.objectStore(STORE_NAME));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function readCachedTasksPage() {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve<CachedTasksPage | null>(null);
  }

  return withStore<CachedTasksPage | undefined>("readonly", (store) =>
    store.get(CACHE_KEY),
  ).then((page) => page ?? null);
}

export function writeCachedTasksPage(page: TasksPage) {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve();
  }

  const cachedPage: CachedTasksPage = {
    ...page,
    cachedAt: Date.now(),
  };

  return withStore<IDBValidKey>("readwrite", (store) =>
    store.put(cachedPage, CACHE_KEY),
  ).then(() => undefined);
}
