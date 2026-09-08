export const cache = new Map<string, any>()

export const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString()

  if (cache.has(paramString)) {
    return cache.get(paramString)
  }

  const requestPromise = (async () => {
    const response = await fetch(
      `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
    )
    return response.json()
  })()
  cache.set(paramString, requestPromise)

  try {
    const responseJson = await requestPromise
    cache.set(paramString, responseJson)
    return responseJson
  } catch (error) {
    if (cache.get(paramString) === requestPromise) {
      cache.delete(paramString)
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
