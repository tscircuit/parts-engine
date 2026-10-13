export const cache = new Map<string, any>()

export const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString()

  const requestUrl = `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`

  if (cache.has(requestUrl)) {
    return cache.get(requestUrl)
  }

  const requestPromise = (async () => {
    const response = await fetch(requestUrl)
    return response.json()
  })()
  cache.set(requestUrl, requestPromise)

  try {
    const responseJson = await requestPromise
    cache.set(requestUrl, responseJson)
    return responseJson
  } catch (error) {
    if (cache.get(requestUrl) === requestPromise) {
      cache.delete(requestUrl)
    }
    throw error
  }
}

export const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!parts) return []
  return [...parts].sort(
    (a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false),
  )
}
