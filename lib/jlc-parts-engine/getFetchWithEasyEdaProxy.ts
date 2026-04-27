import type { EasyEdaProxyConfig, PlatformFetch } from "./types"

const EASYEDA_API_ORIGIN = "https://easyeda.com"
const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"])

const getRequestUrl = (
  requestInput: Parameters<typeof fetch>[0] | URL,
): string => {
  if (typeof requestInput === "string") return requestInput
  if (requestInput instanceof URL) return requestInput.toString()
  return requestInput.url
}

const createMergedTargetRequest = (
  requestInput: Parameters<typeof fetch>[0] | URL,
  requestInit?: Parameters<typeof fetch>[1],
): Request => {
  if (requestInput instanceof URL) {
    return new Request(requestInput.toString(), requestInit)
  }
  if (typeof requestInput === "string") {
    return new Request(requestInput, requestInit)
  }
  return new Request(requestInput, requestInit)
}

const isEasyEdaApiRequestUrl = (requestUrl: string): boolean =>
  requestUrl.startsWith(`${EASYEDA_API_ORIGIN}/api/`)

export const getFetchWithEasyEdaProxy = ({
  platformFetch: upstreamFetch,
  easyEdaProxyConfig,
}: {
  platformFetch: PlatformFetch
  easyEdaProxyConfig: EasyEdaProxyConfig
}): PlatformFetch => {
  return async (
    requestInput: Parameters<typeof fetch>[0] | URL,
    requestInit?: Parameters<typeof fetch>[1],
  ) => {
    const targetRequestUrl = getRequestUrl(requestInput)

    if (!isEasyEdaApiRequestUrl(targetRequestUrl)) {
      return upstreamFetch(requestInput, requestInit)
    }

    const mergedTargetRequest = createMergedTargetRequest(
      requestInput,
      requestInit,
    )
    const targetRequestHeaders = new Headers(mergedTargetRequest.headers)
    const proxyRequestHeaders = new Headers(targetRequestHeaders)

    proxyRequestHeaders.delete("origin")
    proxyRequestHeaders.delete("authority")
    proxyRequestHeaders.delete("host")
    proxyRequestHeaders.delete("referer")
    proxyRequestHeaders.delete("user-agent")
    proxyRequestHeaders.delete("cookie")

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

    const proxyRequestBody = METHODS_WITHOUT_BODY.has(
      mergedTargetRequest.method,
    )
      ? undefined
      : await mergedTargetRequest.clone().arrayBuffer()

    return upstreamFetch(easyEdaProxyConfig.proxyEndpointUrl, {
      method: mergedTargetRequest.method,
      headers: proxyRequestHeaders,
      body: proxyRequestBody,
      signal: requestInit?.signal,
    })
  }
}
