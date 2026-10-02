import type { PartsEngine } from "@tscircuit/props"
import type { AnyCircuitElement } from "circuit-json"
import type { FetchPartCircuitJsonParams } from "../parts-engine"
import { fetchDatasheetInformation as defaultFetchDatasheetInformation } from "./create-datasheet-information-loader"
import { reconcileDatasheetCircuitJson } from "./reconcile-datasheet-circuit-json"
import type { FetchDatasheetInformation } from "./types"

export type DatasheetPartsEngine = Omit<PartsEngine, "fetchPartCircuitJson"> & {
  fetchDatasheetInformation: FetchDatasheetInformation
  fetchPartCircuitJson?: (
    params: FetchPartCircuitJsonParams & {
      includeDatasheetInformation?: boolean
    },
  ) => Promise<AnyCircuitElement[] | undefined>
}

/** Compose a supplier engine with an independently replaceable datasheet provider. */
export function withDatasheetInformation(
  supplierPartsEngine: PartsEngine & {
    fetchPartCircuitJson: NonNullable<PartsEngine["fetchPartCircuitJson"]>
  },
  options?: {
    fetchDatasheetInformation?: FetchDatasheetInformation
    includeDatasheetInformation?: boolean
  },
): DatasheetPartsEngine & {
  fetchPartCircuitJson: NonNullable<
    DatasheetPartsEngine["fetchPartCircuitJson"]
  >
}
export function withDatasheetInformation(
  supplierPartsEngine: PartsEngine,
  options?: {
    fetchDatasheetInformation?: FetchDatasheetInformation
    includeDatasheetInformation?: boolean
  },
): DatasheetPartsEngine
export function withDatasheetInformation(
  supplierPartsEngine: PartsEngine,
  {
    fetchDatasheetInformation = defaultFetchDatasheetInformation,
    includeDatasheetInformation = false,
  }: {
    fetchDatasheetInformation?: FetchDatasheetInformation
    /** Optional convenience enrichment; explicit datasheet calls always fetch. */
    includeDatasheetInformation?: boolean
  } = {},
): DatasheetPartsEngine {
  return {
    findPart: supplierPartsEngine.findPart.bind(supplierPartsEngine),
    fetchDatasheetInformation,
    ...(supplierPartsEngine.fetchPartCircuitJson
      ? {
          fetchPartCircuitJson: async (
            params: FetchPartCircuitJsonParams & {
              includeDatasheetInformation?: boolean
            },
          ) => {
            const {
              includeDatasheetInformation:
                include = includeDatasheetInformation,
              ...supplierParams
            } = params
            const circuitJson = await supplierPartsEngine.fetchPartCircuitJson!(
              {
                ...supplierParams,
                platformFetch: supplierParams.platformFetch as
                  | typeof fetch
                  | undefined,
              },
            )
            if (!include || !circuitJson) return circuitJson
            const components = circuitJson.filter(
              (e) => e.type === "source_component",
            )
            if (components.length !== 1)
              throw new Error(
                "Datasheet enrichment requires a single supplier component",
              )
            const importedManufacturerPartNumber =
              components[0]!.manufacturer_part_number
            if (
              params.manufacturerPartNumber &&
              importedManufacturerPartNumber &&
              params.manufacturerPartNumber.trim().toLowerCase() !==
                importedManufacturerPartNumber.trim().toLowerCase()
            ) {
              throw new Error(
                `Cannot load datasheet attributes for ${params.manufacturerPartNumber}: imported part is ${importedManufacturerPartNumber}`,
              )
            }
            const manufacturerPartNumber =
              importedManufacturerPartNumber ?? params.manufacturerPartNumber
            if (!manufacturerPartNumber) return circuitJson
            const datasheet = await fetchDatasheetInformation({
              manufacturerPartNumber,
              platformFetch: params.platformFetch,
            })
            if (!datasheet) return circuitJson
            return reconcileDatasheetCircuitJson({
              circuitJson,
              datasheetCircuitJson: datasheet.circuitJson,
            }).circuitJson
          },
        }
      : {}),
  }
}
