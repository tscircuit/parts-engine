import { storedDatasheetResponseSchema } from "./stored-datasheet-response-schema"
import { withDatasheetRequestTimeout } from "./with-datasheet-request-timeout"
import { convertDatasheetToCircuitJson } from "./convert-datasheet-to-circuit-json"
import type { PlatformFetch } from "../platform-fetch"
import type {
  DatasheetInformation,
  DatasheetInformationOptions,
  FetchDatasheetInformationParams,
} from "./types"

const normalizeChipName = (chipName: string) =>
  chipName.replace(/[^0-9a-zA-Z_-]/g, "").toLowerCase()

type CacheEntry = {
  expiresAt: number
  result: Promise<DatasheetInformation | undefined>
}

/** Per-engine, per-fetch cache: bounded storage and shared concurrent requests. */
export const createDatasheetInformationLoader = (
  options: DatasheetInformationOptions = {},
) => {
  const caches = new WeakMap<PlatformFetch, Map<string, CacheEntry>>()

  return async ({
    manufacturerPartNumber,
    platformFetch,
  }: FetchDatasheetInformationParams): Promise<
    DatasheetInformation | undefined
  > => {
    const chipName = normalizeChipName(manufacturerPartNumber)
    if (!/[a-z0-9]/.test(chipName)) return undefined
    const fetcher = platformFetch ?? options.platformFetch ?? globalThis.fetch
    let cache = caches.get(fetcher)
    if (!cache) {
      cache = new Map()
      caches.set(fetcher, cache)
    }
    const cached = cache.get(chipName)
    if (cached && cached.expiresAt > Date.now()) {
      return structuredClone(await cached.result)
    }
    cache.delete(chipName)
    if (cache.size >= 256) cache.delete(cache.keys().next().value!)
    const url = new URL(
      "/datasheets/get",
      options.datasheetApiBaseUrl ?? "https://api.tscircuit.com",
    )
    url.searchParams.set("chip_name", chipName)
    const entry: CacheEntry = {
      expiresAt: Infinity,
      result: Promise.resolve(undefined),
    }
    // Start on the next microtask so even a synchronously throwing custom fetch
    // removes the entry after it is inserted below.
    entry.result = Promise.resolve().then(async () => {
      try {
        const fetched = await withDatasheetRequestTimeout(async (signal) => {
          const response = await fetcher(url.toString(), { signal })
          if (response.status === 404) return undefined
          if (!response.ok)
            throw new Error(
              `Datasheet lookup failed (${response.status}) for ${chipName}`,
            )
          const { datasheet } = storedDatasheetResponseSchema.parse(
            await response.json(),
          )
          return { response, datasheet }
        })
        if (!fetched) return undefined
        const { response, datasheet } = fetched
        if (normalizeChipName(datasheet.chip_name) !== chipName) {
          throw new Error(
            `Datasheet lookup returned a different chip for ${chipName}`,
          )
        }
        const circuitJson = convertDatasheetToCircuitJson({
          chipName: manufacturerPartNumber.trim(),
          pinInformation: datasheet.pin_information,
          pinAttributes: datasheet.pin_attributes,
        })
        const cacheControl = response.headers.get("cache-control") ?? ""
        const maxAge = /(?:^|,)\s*max-age\s*=\s*(\d+)/i.exec(cacheControl)
        const age = Number(response.headers.get("age") ?? 0)
        const ttlSeconds = /(?:^|,)\s*(?:no-store|no-cache)\b/i.test(
          cacheControl,
        )
          ? 0
          : Math.max(
              0,
              Math.min(60, maxAge ? Number(maxAge[1]) : 60) -
                (Number.isFinite(age) ? Math.max(0, age) : 60),
            )
        entry.expiresAt = Date.now() + ttlSeconds * 1000
        return {
          datasheetId: datasheet.datasheet_id,
          chipName: datasheet.chip_name,
          datasheetPdfUrls: datasheet.datasheet_pdf_urls,
          circuitJson,
          footprinterString: datasheet.footprinter_string,
          generatedTsx: datasheet.generated_tsx,
        }
      } finally {
        // Do not cache misses, errors or invalid responses. Do not delete a newer
        // entry if this pending request was evicted to keep the cache bounded.
        if (entry.expiresAt === Infinity || entry.expiresAt <= Date.now()) {
          if (cache.get(chipName) === entry) cache.delete(chipName)
        }
      }
    })
    cache.set(chipName, entry)
    return structuredClone(await entry.result)
  }
}

/** Default registry provider, reusable without any supplier engine. */
export const fetchDatasheetInformation = createDatasheetInformationLoader()
