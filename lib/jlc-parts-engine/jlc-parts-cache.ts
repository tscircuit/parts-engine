export const cache = new Map<string, any>()
const pendingRequests = new Map<string, Promise<any>>()

export const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString()

  if (cache.has(paramString)) {
    return cache.get(paramString)
  }

  const pendingRequest = pendingRequests.get(paramString)
  if (pendingRequest) return pendingRequest

  const request = (async () => {
    const response = await fetch(
      `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
    )
    const responseJson = await response.json()
    cache.set(paramString, responseJson)
    return responseJson
  })()
  pendingRequests.set(paramString, request)

  try {
    return await request
  } finally {
    pendingRequests.delete(paramString)
  }
}

export const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!parts) return []
  return [...parts].sort(
    (a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false),
  )
}
