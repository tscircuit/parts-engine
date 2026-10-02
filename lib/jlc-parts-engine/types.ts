import type { PlatformFetch } from "../platform-fetch"
export type { PlatformFetch } from "../platform-fetch"

export type { FetchPartCircuitJsonParams } from "../parts-engine"

export type EasyEdaProxyConfig = {
  proxyEndpointUrl: string
  headers?: Record<string, string>
}

export type JlcPcbPartsEngineOptions = {
  platformFetch?: PlatformFetch
  easyEdaProxyConfig?: EasyEdaProxyConfig
  /** Include registry pin attributes in imported source ports. Defaults to false. */
  includeDatasheetInformation?: boolean
  /** Registry endpoint, independent of the EasyEDA proxy. */
  datasheetApiBaseUrl?: string
}
