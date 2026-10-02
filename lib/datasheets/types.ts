import type { AnyCircuitElement } from "circuit-json"
import type { PlatformFetch } from "../platform-fetch"

/** Supplier-independent electrical metadata; attributes use Circuit JSON fields. */
export type DatasheetInformation = {
  datasheetId: string
  chipName: string
  circuitJson: AnyCircuitElement[]
  datasheetPdfUrls?: string[] | null
  footprinterString?: string | null
  /** Source text only. Never evaluated by the parts engine. */
  generatedTsx?: string | null
}

export type DatasheetInformationOptions = {
  /** Registry endpoint; independent of supplier URLs and EasyEDA proxies. */
  datasheetApiBaseUrl?: string
  platformFetch?: PlatformFetch
}

export type FetchDatasheetInformationParams = {
  manufacturerPartNumber: string
  platformFetch?: PlatformFetch
}

export type FetchDatasheetInformation = (
  params: FetchDatasheetInformationParams,
) => Promise<DatasheetInformation | undefined>
