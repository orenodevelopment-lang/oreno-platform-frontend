type Entry = { data: Record<string, unknown>; at: number };
const entries = new Map<string, Entry>();
let generation = 0;
export function resourceGeneration() {
  return generation;
}
export function readResource(key: string) {
  return entries.get(key);
}
export function cacheResource(
  key: string,
  data: Record<string, unknown>,
  expectedGeneration: number,
) {
  if (expectedGeneration !== generation) return;
  entries.delete(key);
  entries.set(key, { data, at: Date.now() });
  if (entries.size > 100) entries.delete(entries.keys().next().value!);
}
export function clearResources() {
  generation++;
  entries.clear();
}

export function forgetResource(key: string) {
  entries.delete(key);
}
