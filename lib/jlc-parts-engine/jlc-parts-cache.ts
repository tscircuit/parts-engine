import { getPartsEngineUrl } from "../get-parts-engine-url"
import type { JlcPcbPartsEngineOptions } from "./types"

export const cache = new Map<string, any>()

const isHtmlResponseText = (responseText: string): boolean => {
  const trimmedText = responseText.trimStart()
  return (
    trimmedText.startsWith("<!DOCTYPE") ||
    trimmedText.startsWith("<!doctype") ||
    trimmedText.startsWith("<html") ||
    trimmedText.startsWith("<HTML")
  )
}

const getPayloadTypeName = (payload: unknown): string => {
  if (payload === null) return "null"
  if (Array.isArray(payload)) return "array"
  return typeof payload
}

const parseJlcSearchResponse = async ({
  response,
  requestUrl,
  categoryName,
}: {
  response: Response
  requestUrl: string
  categoryName: string
}): Promise<Record<string, any[]>> => {
  if (!response) {
    throw new Error(
      `Invalid payload from jlcsearch (${requestUrl}): Missing response`,
    )
  }

  if (response.ok === false) {
    let errorBodyText = ""
    if (typeof response.text === "function") {
      try {
        errorBodyText = (await response.text()).trim()
      } catch {}
    }
    if (isHtmlResponseText(errorBodyText)) {
      throw new Error(
        `Failed to fetch from jlcsearch (${response.status}): Received HTML response instead of JSON from ${requestUrl}. Response starts with: ${errorBodyText.slice(0, 100)}`,
      )
    }
    throw new Error(
      `Failed to fetch from jlcsearch (${response.status}) from ${requestUrl}${errorBodyText ? `: ${errorBodyText.slice(0, 200)}` : ""}`,
    )
  }

  const clonedResponse =
    typeof response.clone === "function" ? response.clone() : undefined

  let parsedPayload: unknown
  try {
    if (typeof response.json === "function") {
      parsedPayload = await response.json()
    } else if (typeof response.text === "function") {
      parsedPayload = JSON.parse(await response.text())
    } else {
      throw new Error("Response does not support json() or text()")
    }
  } catch (error) {
    let rawResponseText = ""
    if (clonedResponse && typeof clonedResponse.text === "function") {
      try {
        rawResponseText = (await clonedResponse.text()).trim()
      } catch {}
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      isHtmlResponseText(rawResponseText) ||
      errorMessage.includes("<!DOCTYPE") ||
      errorMessage.includes("<!doctype") ||
      errorMessage.includes("<html")
    ) {
      const previewSuffix = rawResponseText
        ? `. Response starts with: ${rawResponseText.slice(0, 100)}`
        : ""
      throw new Error(
        `Invalid payload from jlcsearch (${requestUrl}): Received HTML response instead of JSON${previewSuffix}`,
      )
    }
    const detailSuffix = rawResponseText
      ? `: ${rawResponseText.slice(0, 200)}`
      : `: ${errorMessage}`
    throw new Error(
      `Invalid JSON payload from jlcsearch (${requestUrl})${detailSuffix}`,
    )
  }

  if (typeof parsedPayload === "string") {
    if (isHtmlResponseText(parsedPayload)) {
      throw new Error(
        `Invalid payload from jlcsearch (${requestUrl}): Received HTML response instead of JSON. Response starts with: ${parsedPayload.trimStart().slice(0, 100)}`,
      )
    }
    if (parsedPayload.trim().toLowerCase() === "not found") {
      return { [categoryName]: [] }
    }
    throw new Error(
      `Invalid payload from jlcsearch (${requestUrl}): Expected JSON object but got string: "${parsedPayload.slice(0, 100)}"`,
    )
  }

  if (
    !parsedPayload ||
    Array.isArray(parsedPayload) ||
    typeof parsedPayload !== "object"
  ) {
    throw new Error(
      `Invalid payload from jlcsearch (${requestUrl}): Expected JSON object but got ${getPayloadTypeName(parsedPayload)}`,
    )
  }

  const payloadRecord = parsedPayload as Record<string, unknown>
  const categoryItems = payloadRecord[categoryName]

  if (
    categoryItems !== undefined &&
    categoryItems !== null &&
    !Array.isArray(categoryItems)
  ) {
    throw new Error(
      `Invalid payload from jlcsearch (${requestUrl}): Expected "${categoryName}" to be an array but got ${getPayloadTypeName(categoryItems)}`,
    )
  }

  if (categoryItems === undefined && typeof payloadRecord.error === "string") {
    throw new Error(
      `Invalid payload from jlcsearch (${requestUrl}): ${payloadRecord.error}`,
    )
  }

  return payloadRecord as Record<string, any[]>
}

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
      return parseJlcSearchResponse({
        response,
        requestUrl: cacheKey,
        categoryName: name,
      })
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

const hasValidLcscPartNumber = (partCandidate: any): boolean => {
  if (!partCandidate || typeof partCandidate !== "object") return false
  const lcscNumber = partCandidate.lcsc
  if (lcscNumber === undefined || lcscNumber === null) return false
  return String(lcscNumber).trim() !== ""
}

export const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!Array.isArray(parts)) return []
  return parts
    .filter(hasValidLcscPartNumber)
    .sort((a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false))
}
