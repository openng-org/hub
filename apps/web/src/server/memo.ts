/**
 * Remembers a derived view per key. The datasets only change with a deploy, so anything computed
 * from them for a finite set of keys (a major, an organizer) is computed once per process. Never
 * key on free text: a search term is not a cache key.
 */
export function memo<K, V>(compute: (key: K) => V): (key: K) => V {
  const cache = new Map<K, V>();
  return (key) => {
    if (!cache.has(key)) cache.set(key, compute(key));
    return cache.get(key)!;
  };
}
