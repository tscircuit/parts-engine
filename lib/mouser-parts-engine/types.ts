import type { PlatformFetch } from "../jlc-parts-engine/types"

export type MouserPartsEngineOptions = {
  platformFetch?: PlatformFetch
  apiBaseUrl?: string
}

export type MouserSearchPart = {
  mouser_product_number: string
  supplier_part_number?: string
  mfr: string
  manufacturer?: string
  package?: string
  description?: string
  stock: number
  price?: number
  normally_stocking?: boolean
}
