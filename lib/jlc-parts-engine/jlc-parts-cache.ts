export const cache = new Map<string, any>()

type JlcPartsQueryString = string & {
  readonly __brand: "JlcPartsQueryString"
}

type JlcPartsLookupResult = Record<
  string,
  Array<Record<string, unknown>> | undefined
>

const pendingRequestPromiseByQueryString = new Map<
  JlcPartsQueryString,
  Promise<JlcPartsLookupResult>
>()

export const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString() as JlcPartsQueryString

  if (cache.has(paramString)) {
    return cache.get(paramString)
  }

  const pendingRequestPromise =
    pendingRequestPromiseByQueryString.get(paramString)
  if (pendingRequestPromise) return pendingRequestPromise

  const requestPromise = (async (): Promise<JlcPartsLookupResult> => {
    const response = await fetch(
      `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
    )
    const responseJson = (await response.json()) as JlcPartsLookupResult
    cache.set(paramString, responseJson)
    return responseJson
  })()
  pendingRequestPromiseByQueryString.set(paramString, requestPromise)

  try {
    return await requestPromise
  } finally {
    pendingRequestPromiseByQueryString.delete(paramString)
  }
}

export const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!parts) return []
  return [...parts].sort(
    (a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false),
  )
}
