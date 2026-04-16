import type { EasyEdaProxyConfig, PlatformFetch } from "./types"

const EASYEDA_API_ORIGIN = "https://easyeda.com"

const getRequestUrl = (
  requestInput: Parameters<typeof fetch>[0] | URL,
): string => {
  if (typeof requestInput === "string") return requestInput
  if (requestInput instanceof URL) return requestInput.toString()
  return requestInput.url
}

const isEasyEdaApiRequestUrl = (requestUrl: string): boolean =>
  requestUrl.startsWith(`${EASYEDA_API_ORIGIN}/api/`)

const getEasyEdaProxyUrl = (apiBaseUrl: string): string =>
  `${apiBaseUrl.replace(/\/+$/, "")}/proxy`

export const fetchWithEasyEdaProxy = ({
  platformFetch,
  easyEdaProxy: easyEdaProxyConfig,
}: {
  platformFetch: PlatformFetch
  easyEdaProxy: EasyEdaProxyConfig
}): PlatformFetch => {
  return (
    requestInput: Parameters<typeof fetch>[0] | URL,
    requestInit?: Parameters<typeof fetch>[1],
  ) => {
    const targetRequestUrl = getRequestUrl(requestInput)

    if (!isEasyEdaApiRequestUrl(targetRequestUrl)) {
      return platformFetch(requestInput, requestInit)
    }

    const targetRequestHeaders = new Headers(requestInit?.headers)
    const proxyRequestHeaders = new Headers(targetRequestHeaders)

    proxyRequestHeaders.set("X-Target-Url", targetRequestUrl)
    proxyRequestHeaders.set(
      "X-Sender-Origin",
      targetRequestHeaders.get("origin") ?? "",
    )
    proxyRequestHeaders.set(
      "X-Sender-Host",
      targetRequestHeaders.get("host") ?? EASYEDA_API_ORIGIN,
    )
    proxyRequestHeaders.set(
      "X-Sender-Referer",
      targetRequestHeaders.get("referer") ?? "",
    )
    proxyRequestHeaders.set(
      "X-Sender-User-Agent",
      targetRequestHeaders.get("user-agent") ?? "",
    )
    proxyRequestHeaders.set(
      "X-Sender-Cookie",
      targetRequestHeaders.get("cookie") ?? "",
    )
    proxyRequestHeaders.set(
      "authority",
      targetRequestHeaders.get("authority") ??
        targetRequestHeaders.get("host") ??
        "",
    )
    proxyRequestHeaders.set(
      "content-type",
      targetRequestHeaders.get("content-type") ?? "",
    )

    for (const [name, value] of Object.entries(
      easyEdaProxyConfig.headers ?? {},
    )) {
      proxyRequestHeaders.set(name, value)
    }

    return platformFetch(getEasyEdaProxyUrl(easyEdaProxyConfig.apiBaseUrl), {
      ...requestInit,
      headers: proxyRequestHeaders,
    })
  }
}
