export type PlatformFetch = typeof fetch

export type FetchPartCircuitJsonParams = {
  supplierPartNumber?: string
  manufacturerPartNumber?: string
  platformFetch?: PlatformFetch
}

export type CreateJlcPartsEngineOptions = {
  platformFetch?: PlatformFetch
}
