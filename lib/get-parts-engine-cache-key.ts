import type { PlatformFetch } from "./platform-fetch"

const fetchIds = new WeakMap<PlatformFetch, number>()
let nextFetchId = 0

export const getPartsEngineCacheKey = (
  url: string,
  platformFetch?: PlatformFetch,
): string => {
  // Keep the default cache's URL keys and exported Map.clear() behavior.
  if (!platformFetch) return url

  let fetchId = fetchIds.get(platformFetch)
  if (fetchId === undefined) {
    fetchId = nextFetchId++
    fetchIds.set(platformFetch, fetchId)
  }

  return `fetch:${fetchId}:${url}`
}
