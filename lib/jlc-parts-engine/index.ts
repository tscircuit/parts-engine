import { JlcPcbPartsEngine } from "./JlcPartsEngine"

export { JlcPcbPartsEngine }
export { cache } from "./jlc-parts-cache"
export { getFetchWithEasyEdaProxy } from "./getFetchWithEasyEdaProxy"
export type {
  PlatformFetch,
  FetchPartCircuitJsonParams,
  EasyEdaProxyConfig,
  JlcPcbPartsEngineOptions,
} from "./types"

export const jlcPartsEngine: JlcPcbPartsEngine = new JlcPcbPartsEngine()
