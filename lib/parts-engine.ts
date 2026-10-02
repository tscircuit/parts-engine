import type { PlatformFetch } from "./platform-fetch"

export type FetchPartCircuitJsonParams = {
  supplierPartNumber?: string
  manufacturerPartNumber?: string
  platformFetch?: PlatformFetch
  /** Overrides the engine default for this import. */
  includeDatasheetInformation?: boolean
}
