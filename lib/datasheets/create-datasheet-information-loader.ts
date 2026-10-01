import { commonComponentProps } from "@tscircuit/props"
import { z } from "zod"
import type { PlatformFetch } from "../jlc-parts-engine/types"
import type {
  DatasheetInformation,
  DatasheetInformationOptions,
  FetchDatasheetInformationParams,
} from "./types"

const responseSchema = z.object({
  datasheet: z.object({
    datasheet_id: z.string().uuid(),
    chip_name: z.string(),
    datasheet_pdf_urls: z.array(z.string()).nullish(),
    pin_information: z
      .array(
        z.object({
          pin_number: z.string(),
          name: z.array(z.string()),
          description: z.string(),
          capabilities: z.array(z.string()),
        }),
      )
      .nullish(),
    pin_attributes: commonComponentProps.shape.pinAttributes.nullable(),
    footprinter_string: z.string().nullish(),
    generated_tsx: z.string().nullish(),
  }),
})

const normalizeChipName = (chipName: string) =>
  chipName.replace(/[^0-9a-zA-Z_-]/g, "").toLowerCase()

type CacheEntry = {
  expiresAt: number
  result: Promise<DatasheetInformation | undefined>
}

/** Per-engine, per-fetch cache: bounded storage and shared concurrent requests. */
export const createDatasheetInformationLoader = (
  options: DatasheetInformationOptions & { platformFetch?: PlatformFetch } = {},
) => {
  const caches = new WeakMap<PlatformFetch, Map<string, CacheEntry>>()

  return async ({
    manufacturerPartNumber,
    platformFetch,
    includeDatasheetInformation = options.includeDatasheetInformation ?? false,
  }: FetchDatasheetInformationParams): Promise<
    DatasheetInformation | undefined
  > => {
    if (!includeDatasheetInformation) return undefined
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
        const response = await fetcher(url.toString(), {
          signal: AbortSignal.timeout(10_000),
        })
        if (response.status === 404) return undefined
        if (!response.ok)
          throw new Error(
            `Datasheet lookup failed (${response.status}) for ${chipName}`,
          )
        const { datasheet } = responseSchema.parse(await response.json())
        if (normalizeChipName(datasheet.chip_name) !== chipName) {
          throw new Error(
            `Datasheet lookup returned a different chip for ${chipName}`,
          )
        }
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
          pinInformation: datasheet.pin_information,
          pinAttributes: datasheet.pin_attributes,
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
