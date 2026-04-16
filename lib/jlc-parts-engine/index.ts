import { JlcPcbPartsEngine } from "./JlcPartsEngine"

export { JlcPcbPartsEngine }
export { cache } from "./jlc-parts-cache"
export { fetchWithEasyEdaProxy } from "./fetchWithEasyEdaProxy"
export type {
  PlatformFetch,
  FetchPartCircuitJsonParams,
  EasyEdaProxyConfig,
  JlcPcbPartsEngineOptions,
} from "./types"

export const jlcPartsEngine: JlcPcbPartsEngine = new JlcPcbPartsEngine()
