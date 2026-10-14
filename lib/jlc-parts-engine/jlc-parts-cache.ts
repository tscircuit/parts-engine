import { getPartsEngineUrl } from "../get-parts-engine-url"
import type { JlcPcbPartsEngineOptions } from "./types"

export const cache = new Map<string, any>()

export const createJlcPartsFetcher =
  (
    options: Pick<
      JlcPcbPartsEngineOptions,
      "jlcSearchBaseUrl" | "platformFetch"
    > = {},
  ) =>
  async (name: string, params: Record<string, unknown>) => {
    const paramString = new URLSearchParams(
      Object.entries({ ...params, json: "true" }).map(
        ([name, constraint]): [string, string] => [name, String(constraint)],
      ),
    ).toString()
    const url = getPartsEngineUrl({
      path: `${name}/list?${paramString}`,
      baseUrl: options.jlcSearchBaseUrl,
      environmentVariable: "TSCIRCUIT_JLCSEARCH_BASE_URL",
      defaultBaseUrl: "https://jlcsearch.tscircuit.com",
    })
    const cacheKey = url.toString()

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    const requestPromise = (async () => {
      const response = await (options.platformFetch ?? globalThis.fetch)(
        cacheKey,
      )
      return response.json()
    })()
    cache.set(cacheKey, requestPromise)

    try {
      const responseJson = await requestPromise
      cache.set(cacheKey, responseJson)
      return responseJson
    } catch (error) {
      if (cache.get(cacheKey) === requestPromise) {
        cache.delete(cacheKey)
      }
      throw error
    }
  }

export const getJlcPartsCached = createJlcPartsFetcher()

export const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!parts) return []
  return [...parts].sort(
    (a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false),
  )
}
