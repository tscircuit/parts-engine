import {
  JlcPcbPartsEngine,
  createDatasheetInformationLoader,
  withDatasheetInformation,
} from "../../index"
import type { JlcPcbPartsEngineOptions } from "../../lib/jlc-parts-engine/types"

export const createDatasheetTestEngine = ({
  includeDatasheetInformation,
  datasheetApiBaseUrl,
  ...supplierOptions
}: JlcPcbPartsEngineOptions & {
  includeDatasheetInformation?: boolean
  datasheetApiBaseUrl?: string
} = {}) =>
  withDatasheetInformation(new JlcPcbPartsEngine(supplierOptions), {
    includeDatasheetInformation,
    fetchDatasheetInformation: createDatasheetInformationLoader({
      platformFetch: supplierOptions.platformFetch,
      datasheetApiBaseUrl,
    }),
  })
