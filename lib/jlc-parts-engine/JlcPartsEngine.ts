import { createDatasheetInformationLoader } from "../datasheets/create-datasheet-information-loader"
import { enrichPartCircuitJsonWithDatasheet } from "../datasheets/enrich-part-circuit-json-with-datasheet"
import type { FetchDatasheetInformation } from "../datasheets/types"
import type { FetchPartCircuitJsonParams } from "../parts-engine"
import type { PartsEngine } from "@tscircuit/props"
import type { FetchPartAvailabilityParams } from "@tscircuit/props"
import { fetchJlcPartAvailability } from "./fetch-jlc-part-availability"
import {
  fetchEasyEDAComponent,
  EasyEdaJsonSchema,
  convertEasyEdaJsonToCircuitJson,
} from "easyeda/browser"
import { getJlcpcbPackageName } from "../footprint-translators/index"
import { getFetchWithEasyEdaProxy } from "./getFetchWithEasyEdaProxy"
import {
  getJstConnectorSearchConfig,
  isCompatiblePcbMountJstConnector,
} from "./get-jst-connector-search-config"
import { getPinHeaderSearchParams } from "./get-pin-header-search-params"
import { getJlcPartsCached, withBasicPartPreference } from "./jlc-parts-cache"
import type { JlcPcbPartsEngineOptions, PlatformFetch } from "./types"

const normalizePartNumber = (partNumber: unknown) =>
  typeof partNumber === "string" ? partNumber.trim().toLowerCase() : undefined

const getPinHeaderRowCount = (
  footprinterString?: string,
): number | undefined => {
  if (!footprinterString || !/^pinrow\d+(?:_|$)/i.test(footprinterString)) {
    return undefined
  }

  const rows = footprinterString.match(/(?:^|_)rows(\d+)(?:_|$)/i)
  // Generated pinrow footprints have one row unless explicitly overridden.
  return rows ? Number(rows[1]) : 1
}

export class JlcPcbPartsEngine implements PartsEngine {
  private readonly defaultPlatformFetch: JlcPcbPartsEngineOptions["platformFetch"]
  private readonly easyEdaProxyConfig: JlcPcbPartsEngineOptions["easyEdaProxyConfig"]

  private readonly includeDatasheetInformation: boolean
  private readonly fetchDatasheetInformation: FetchDatasheetInformation

  constructor({
    platformFetch: defaultPlatformFetch,
    easyEdaProxyConfig,
    includeDatasheetInformation = false,
    datasheetApiBaseUrl,
  }: JlcPcbPartsEngineOptions = {}) {
    this.defaultPlatformFetch = defaultPlatformFetch
    this.easyEdaProxyConfig = easyEdaProxyConfig
    this.includeDatasheetInformation = includeDatasheetInformation
    this.fetchDatasheetInformation = createDatasheetInformationLoader({
      platformFetch: defaultPlatformFetch,
      datasheetApiBaseUrl,
    })
    this.fetchPartCircuitJson = this.fetchPartCircuitJson.bind(this)
    this.fetchPartAvailability = this.fetchPartAvailability.bind(this)
  }

  async fetchPartAvailability(request: FetchPartAvailabilityParams) {
    return fetchJlcPartAvailability({
      ...request,
      platformFetch:
        request.platformFetch ?? this.defaultPlatformFetch ?? globalThis.fetch,
    })
  }

  private getEasyEdaPlatformFetch(
    platformFetchOverride?: PlatformFetch,
  ): PlatformFetch {
    const resolvedPlatformFetch =
      platformFetchOverride ?? this.defaultPlatformFetch ?? globalThis.fetch

    if (!this.easyEdaProxyConfig) {
      return resolvedPlatformFetch
    }

    return getFetchWithEasyEdaProxy({
      platformFetch: resolvedPlatformFetch,
      easyEdaProxyConfig: this.easyEdaProxyConfig,
    })
  }

  async findPart({
    sourceComponent,
    footprinterString,
  }: Parameters<PartsEngine["findPart"]>[0]) {
    const jlcpcbPackage = getJlcpcbPackageName(footprinterString)

    if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_resistor"
    ) {
      const { resistors } = await getJlcPartsCached("resistors", {
        resistance: sourceComponent.resistance,
        package: jlcpcbPackage,
      })

      return {
        jlcpcb: withBasicPartPreference(resistors)
          .map((r: any) => `C${r.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_capacitor"
    ) {
      const { capacitors } = await getJlcPartsCached("capacitors", {
        capacitance: sourceComponent.capacitance,
        package: jlcpcbPackage,
      })

      return {
        jlcpcb: withBasicPartPreference(capacitors)
          .map((c: any) => `C${c.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_pin_header"
    ) {
      const { headers } = await getJlcPartsCached(
        "headers",
        getPinHeaderSearchParams(sourceComponent, footprinterString),
      )
      const rowCount = getPinHeaderRowCount(footprinterString)
      const compatibleHeaders = headers?.filter(
        (header: { num_rows?: number }) =>
          rowCount === undefined || header.num_rows === rowCount,
      )
      return {
        jlcpcb: withBasicPartPreference(compatibleHeaders)
          .map((h: any) => `C${h.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_potentiometer"
    ) {
      const { potentiometers } = await getJlcPartsCached("potentiometers", {
        resistance: sourceComponent.max_resistance,
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(potentiometers)
          .map((p: any) => `C${p.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_diode"
    ) {
      const { diodes } = await getJlcPartsCached("diodes", {
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(diodes)
          .map((d: any) => `C${d.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_chip"
    ) {
      if (!jlcpcbPackage || !footprinterString) {
        return {}
      }
      const { chips } = await getJlcPartsCached("chips", {
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(chips)
          .map((c: any) => `C${c.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_transistor"
    ) {
      const { transistors } = await getJlcPartsCached("transistors", {
        package: jlcpcbPackage,
        transistor_type: sourceComponent.transistor_type,
      })
      return {
        jlcpcb: withBasicPartPreference(transistors)
          .map((t: any) => `C${t.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_power_source"
    ) {
      const { power_sources } = await getJlcPartsCached("power_sources", {
        voltage: sourceComponent.voltage,
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(power_sources)
          .map((p: any) => `C${p.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_inductor"
    ) {
      const { inductors } = await getJlcPartsCached("inductors", {
        inductance: sourceComponent.inductance,
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(inductors)
          .map((i: any) => `C${i.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_crystal"
    ) {
      const { crystals } = await getJlcPartsCached("crystals", {
        frequency: sourceComponent.frequency,
        load_capacitance: sourceComponent.load_capacitance,
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(crystals)
          .map((c: any) => `C${c.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_mosfet"
    ) {
      const { mosfets } = await getJlcPartsCached("mosfets", {
        package: jlcpcbPackage,
        mosfet_mode: sourceComponent.mosfet_mode,
        channel_type: sourceComponent.channel_type,
      })
      return {
        jlcpcb: withBasicPartPreference(mosfets)
          .map((m: any) => `C${m.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_resonator"
    ) {
      const { resonators } = await getJlcPartsCached("resonators", {
        frequency: sourceComponent.frequency,
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(resonators)
          .map((r: any) => `C${r.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_switch"
    ) {
      const { switches } = await getJlcPartsCached("switches", {
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(switches)
          .map((s: any) => `C${s.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_led"
    ) {
      const { leds } = await getJlcPartsCached("leds", {
        package: jlcpcbPackage,
        color: sourceComponent.color,
      })
      return {
        jlcpcb: withBasicPartPreference(leds)
          .map((l: any) => `C${l.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_fuse"
    ) {
      const { fuses } = await getJlcPartsCached("fuses", {
        package: jlcpcbPackage,
      })
      return {
        jlcpcb: withBasicPartPreference(fuses)
          .map((l: any) => `C${l.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_connector" &&
      sourceComponent.standard === "usb_c"
    ) {
      const { usb_c_connectors } = await getJlcPartsCached(
        "usb_c_connectors",
        {},
      )
      return {
        jlcpcb: withBasicPartPreference(usb_c_connectors)
          .map((c: any) => `C${c.lcsc}`)
          .slice(0, 3),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_connector"
    ) {
      const searchConfig = getJstConnectorSearchConfig(sourceComponent.standard)

      if (!searchConfig || !sourceComponent.pin_count) {
        return {}
      }

      const { jst_connectors } = await getJlcPartsCached("jst_connectors", {
        pitch_mm: searchConfig.pitchMm,
        num_pins: sourceComponent.pin_count,
      })
      const compatiblePcbMountConnectors = jst_connectors?.filter(
        (connector: any) =>
          isCompatiblePcbMountJstConnector(
            connector,
            searchConfig.compatibleReferenceSeries,
          ),
      )

      return {
        jlcpcb: withBasicPartPreference(compatiblePcbMountConnectors)
          .map((connector: any) => `C${connector.lcsc}`)
          .slice(0, 3),
      }
    }

    return {}
  }

  async fetchPartCircuitJson({
    supplierPartNumber,
    manufacturerPartNumber,
    platformFetch: platformFetchOverride,
    includeDatasheetInformation = this.includeDatasheetInformation,
  }: FetchPartCircuitJsonParams) {
    const easyEdaPlatformFetch = this.getEasyEdaPlatformFetch(
      platformFetchOverride,
    )
    let resolvedSupplierPartNumber = supplierPartNumber

    if (!resolvedSupplierPartNumber && manufacturerPartNumber) {
      const { components } = await getJlcPartsCached("components", {
        search: manufacturerPartNumber,
      })
      const normalizedManufacturerPartNumber = normalizePartNumber(
        manufacturerPartNumber,
      )
      const exactManufacturerPartMatch = components?.find(
        (component: any) =>
          normalizePartNumber(component.mfr) ===
          normalizedManufacturerPartNumber,
      )
      const componentMatch =
        exactManufacturerPartMatch ??
        (includeDatasheetInformation ? undefined : components?.[0])
      resolvedSupplierPartNumber = componentMatch
        ? `C${componentMatch.lcsc}`
        : undefined
    }

    if (!resolvedSupplierPartNumber) return undefined

    const rawEasyEdaJson = await fetchEasyEDAComponent(
      resolvedSupplierPartNumber,
      {
        fetch: easyEdaPlatformFetch as typeof fetch,
      },
    )
    const parsed = EasyEdaJsonSchema.parse(rawEasyEdaJson)
    const circuitJson = convertEasyEdaJsonToCircuitJson(parsed)
    // Keep supplier-reported identity for exact datasheet matching.
    const importedManufacturerPartNumber =
      parsed.dataStr.head.c_para["Manufacturer Part"]?.trim()
    const partCircuitJson = circuitJson.map((element) =>
      element.type === "source_component" && importedManufacturerPartNumber
        ? {
            ...element,
            manufacturer_part_number: importedManufacturerPartNumber,
          }
        : element,
    )
    if (!includeDatasheetInformation) return partCircuitJson
    return enrichPartCircuitJsonWithDatasheet(
      {
        circuitJson: partCircuitJson,
        manufacturerPartNumber,
        platformFetch: platformFetchOverride,
      },
      { fetchDatasheetInformation: this.fetchDatasheetInformation },
    )
  }
}
