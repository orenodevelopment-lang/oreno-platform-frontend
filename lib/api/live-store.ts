"use client";

import { useSyncExternalStore } from "react";

interface Entry<T> {
  value: T;
  promise?: Promise<void>;
  error?: unknown;
  loadedAt?: number;
}

const entries = new Map<string, Entry<unknown>>();
const listeners = new Set<() => void>();
let revision = 0;

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useApiRevision() {
  return useSyncExternalStore(subscribe, () => revision, () => 0);
}

export function liveValue<T>(key: string, fallback: T, loader: () => Promise<T>, maxAgeMs = 30_000): T {
  let entry = entries.get(key) as Entry<T> | undefined;
  if (!entry) {
    entry = { value: fallback };
    entries.set(key, entry);
  }
  const stale = !entry.loadedAt || Date.now() - entry.loadedAt > maxAgeMs;
  if (typeof window !== "undefined" && stale && !entry.promise) {
    entry.promise = loader()
      .then((value) => {
        entry!.value = value;
        entry!.error = undefined;
        entry!.loadedAt = Date.now();
      })
      .catch((error: unknown) => {
        entry!.error = error;
        entry!.loadedAt = Date.now();
      })
      .finally(() => {
        entry!.promise = undefined;
        emit();
      });
  }
  return entry.value;
}

export function liveError(key: string) {
  return entries.get(key)?.error;
}

export function livePending(key: string) {
  return Boolean(entries.get(key)?.promise);
}

export function setLiveValue<T>(key: string, value: T) {
  entries.set(key, { value, loadedAt: Date.now() });
  emit();
}

export function invalidateLive(prefix?: string) {
  if (!prefix) entries.clear();
  else {
    for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key);
  }
  emit();
}
