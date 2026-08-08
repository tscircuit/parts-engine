import type { PlatformFetch } from "../jlc-parts-engine/types"
import type { MouserSearchPart } from "./types"

export const mouserCache = new Map<string, unknown>()

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/$/, "")

export const getMouserPartsCached = async (
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  options: {
    platformFetch?: PlatformFetch
    apiBaseUrl?: string
  } = {},
): Promise<Record<string, MouserSearchPart[]>> => {
  const platformFetch = options.platformFetch ?? globalThis.fetch
  const baseUrl = normalizeBaseUrl(
    options.apiBaseUrl ?? "https://mousersearch.tscircuit.com",
  )
  const url = new URL(path, `${baseUrl}/`)
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(name, String(value))
    }
  }
  url.searchParams.set("json", "true")

  const cacheKey = url.toString()
  const cached = mouserCache.get(cacheKey)
  if (cached) return cached as Record<string, MouserSearchPart[]>

  const response = await platformFetch(url)
  if (!response.ok) {
    throw new Error(
      `Mouser search failed (${response.status}): ${await response.text()}`,
    )
  }
  const responseJson = (await response.json()) as Record<
    string,
    MouserSearchPart[]
  >
  mouserCache.set(cacheKey, responseJson)
  return responseJson
}

export const withMouserStockPreference = (
  parts: MouserSearchPart[] | undefined,
): MouserSearchPart[] =>
  [...(parts ?? [])].sort(
    (a, b) =>
      Number(b.normally_stocking ?? false) -
        Number(a.normally_stocking ?? false) || (b.stock ?? 0) - (a.stock ?? 0),
  )
