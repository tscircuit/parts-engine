import type { PinAttributeMap } from "@tscircuit/props"
import type { PlatformFetch } from "../jlc-parts-engine/types"

export type DatasheetInformation = {
  datasheetId: string
  chipName: string
  datasheetPdfUrls?: string[] | null
  pinInformation?:
    | {
        pin_number: string
        name: string[]
        description: string
        capabilities: string[]
      }[]
    | null
  /** Physical pin keys (pin1, pinA1, ...), ready for TSX pinAttributes. */
  pinAttributes?: Record<string, PinAttributeMap> | null
  footprinterString?: string | null
  /** Source text only. The parts engine never evaluates it. */
  generatedTsx?: string | null
}

export type DatasheetInformationOptions = {
  /** Opt in to stored datasheet lookups. Defaults to false. */
  includeDatasheetInformation?: boolean
  /** Defaults to https://api.tscircuit.com. Independent of supplier API URLs. */
  datasheetApiBaseUrl?: string
}

export type FetchDatasheetInformationParams = {
  manufacturerPartNumber: string
  platformFetch?: PlatformFetch
  /** Overrides the engine option for this lookup. */
  includeDatasheetInformation?: boolean
}
