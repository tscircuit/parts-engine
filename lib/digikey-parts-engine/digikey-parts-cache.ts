import type { PlatformFetch } from "../jlc-parts-engine/types"
import type { DigiKeySearchPart } from "./types"

export const digikeyCache = new Map<string, unknown>()

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/$/, "")

export const getDigiKeyPartsCached = async (
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  options: {
    platformFetch?: PlatformFetch
    apiBaseUrl?: string
  } = {},
): Promise<Record<string, DigiKeySearchPart[]>> => {
  const platformFetch = options.platformFetch ?? globalThis.fetch
  const baseUrl = normalizeBaseUrl(
    options.apiBaseUrl ?? "https://digikeysearch.tscircuit.com",
  )
  const url = new URL(path, `${baseUrl}/`)
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(name, String(value))
    }
  }
  url.searchParams.set("json", "true")

  const cacheKey = url.toString()
  const cached = digikeyCache.get(cacheKey)
  if (cached) return cached as Record<string, DigiKeySearchPart[]>

  const response = await platformFetch(url)
  if (!response.ok) {
    throw new Error(
      `DigiKey search failed (${response.status}): ${await response.text()}`,
    )
  }
  const responseJson = (await response.json()) as Record<
    string,
    DigiKeySearchPart[]
  >
  digikeyCache.set(cacheKey, responseJson)
  return responseJson
}

export const withDigiKeyStockPreference = (
  parts: DigiKeySearchPart[] | undefined,
): DigiKeySearchPart[] =>
  [...(parts ?? [])].sort(
    (a, b) =>
      Number(b.normally_stocking ?? false) -
        Number(a.normally_stocking ?? false) || (b.stock ?? 0) - (a.stock ?? 0),
  )
