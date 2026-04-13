type Entry<T> = {
  value: T;
  expiresAt: number;
};

declare global {
  var __XRANK_VERTICAL_CACHE__: Map<string, Entry<unknown>> | undefined;
  var __XRANK_VERTICAL_INFLIGHT__: Map<string, Promise<unknown>> | undefined;
}

const store =
  globalThis.__XRANK_VERTICAL_CACHE__ ??
  (globalThis.__XRANK_VERTICAL_CACHE__ = new Map());

const inflight =
  globalThis.__XRANK_VERTICAL_INFLIGHT__ ??
  (globalThis.__XRANK_VERTICAL_INFLIGHT__ = new Map());

export const TTL_15M = 15 * 60 * 1000;

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttl = TTL_15M): T {
  store.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

export async function withCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttl = TTL_15M,
  force = false
): Promise<T> {
  if (!force) {
    const cached = getCache<T>(key);
    if (cached) return cached;

    const running = inflight.get(key);
    if (running) return running as Promise<T>;
  }

  const promise = loader()
    .then((value) => setCache(key, value, ttl))
    .finally(() => inflight.delete(key));

  inflight.set(key, promise as Promise<unknown>);
  return promise;
}
