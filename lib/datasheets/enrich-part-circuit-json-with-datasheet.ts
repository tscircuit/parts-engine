import type { AnyCircuitElement } from "circuit-json"
import type { PlatformFetch } from "../platform-fetch"
import { reconcileDatasheetCircuitJson } from "./reconcile-datasheet-circuit-json"
import type { FetchDatasheetInformation } from "./types"

/** Enrich supplier ports without replacing footprint geometry or connectivity. */
export async function enrichPartCircuitJsonWithDatasheet(
  {
    circuitJson,
    manufacturerPartNumber,
    platformFetch,
  }: {
    circuitJson: AnyCircuitElement[]
    manufacturerPartNumber?: string
    platformFetch?: PlatformFetch
  },
  {
    fetchDatasheetInformation,
  }: { fetchDatasheetInformation: FetchDatasheetInformation },
): Promise<AnyCircuitElement[]> {
  const components = circuitJson.filter((e) => e.type === "source_component")
  if (components.length !== 1)
    throw new Error("Datasheet enrichment requires a single supplier component")
  const importedManufacturerPartNumber = components[0]!.manufacturer_part_number
  if (
    manufacturerPartNumber &&
    importedManufacturerPartNumber &&
    manufacturerPartNumber.trim().toLowerCase() !==
      importedManufacturerPartNumber.trim().toLowerCase()
  ) {
    throw new Error(
      `Cannot load datasheet attributes for ${manufacturerPartNumber}: imported part is ${importedManufacturerPartNumber}`,
    )
  }
  const resolvedManufacturerPartNumber =
    importedManufacturerPartNumber ?? manufacturerPartNumber
  if (!resolvedManufacturerPartNumber) return circuitJson
  const datasheet = await fetchDatasheetInformation({
    manufacturerPartNumber: resolvedManufacturerPartNumber,
    platformFetch,
  })
  if (!datasheet) return circuitJson
  return reconcileDatasheetCircuitJson({
    circuitJson,
    datasheetCircuitJson: datasheet.circuitJson,
  }).circuitJson
}
