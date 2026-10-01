import type { CommonComponentProps } from "@tscircuit/props"
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
  /** Uses the TSX schema directly, including pin-number and label keys. */
  pinAttributes?: CommonComponentProps["pinAttributes"] | null
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
