import type { DatasheetInformationOptions } from "../datasheets/types"
export type PlatformFetch = (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) => ReturnType<typeof fetch>

export type FetchPartCircuitJsonParams = {
  supplierPartNumber?: string
  manufacturerPartNumber?: string
  platformFetch?: PlatformFetch
}

export type EasyEdaProxyConfig = {
  proxyEndpointUrl: string
  headers?: Record<string, string>
}

export type JlcPcbPartsEngineOptions = DatasheetInformationOptions & {
  platformFetch?: PlatformFetch
  easyEdaProxyConfig?: EasyEdaProxyConfig
}
