import type { PartsEngine } from "@tscircuit/props"
import { getJlcpcbPackageName } from "../footprint-translators"
import { getPinHeaderSearchParams } from "../jlc-parts-engine/get-pin-header-search-params"
import {
  getDigiKeyPartsCached,
  withDigiKeyStockPreference,
} from "./digikey-parts-cache"
import type { DigiKeyPartsEngineOptions, DigiKeySearchPart } from "./types"

export class DigiKeyPartsEngine implements PartsEngine {
  private readonly platformFetch: DigiKeyPartsEngineOptions["platformFetch"]
  private readonly apiBaseUrl: string | undefined

  constructor(options: DigiKeyPartsEngineOptions = {}) {
    this.platformFetch = options.platformFetch
    this.apiBaseUrl = options.apiBaseUrl
    this.findPart = this.findPart.bind(this)
  }

  private async getCategoryParts(
    path: string,
    responseKey: string,
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<DigiKeySearchPart[]> {
    const response = await getDigiKeyPartsCached(path, params, {
      platformFetch: this.platformFetch,
      apiBaseUrl: this.apiBaseUrl,
    })
    return response[responseKey] ?? []
  }

  private async getKeywordParts(query: string): Promise<DigiKeySearchPart[]> {
    const response = await getDigiKeyPartsCached(
      "/api/search",
      { q: query, limit: 20 },
      {
        platformFetch: this.platformFetch,
        apiBaseUrl: this.apiBaseUrl,
      },
    )
    return response.components ?? []
  }

  private toSupplierPartNumbers(parts: DigiKeySearchPart[]) {
    return {
      digikey: withDigiKeyStockPreference(parts)
        .map((part) => part.digikey_product_number)
        .filter(Boolean)
        .slice(0, 3),
    }
  }

  async findPart({
    sourceComponent,
    footprinterString,
  }: Parameters<PartsEngine["findPart"]>[0]) {
    if (sourceComponent.type !== "source_component") return {}

    const packageName = getJlcpcbPackageName(footprinterString)

    if (sourceComponent.ftype === "simple_resistor") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/resistors/list", "resistors", {
          resistance: sourceComponent.resistance,
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_capacitor") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/capacitors/list", "capacitors", {
          capacitance: sourceComponent.capacitance,
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_pin_header") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts(
          "/headers/list",
          "headers",
          getPinHeaderSearchParams(sourceComponent, footprinterString),
        ),
      )
    }

    if (sourceComponent.ftype === "simple_potentiometer") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/potentiometers/list", "potentiometers", {
          resistance: sourceComponent.max_resistance,
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_diode") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/diodes/list", "diodes", {
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_transistor") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts(
          "/bjt_transistors/list",
          "bjt_transistors",
          { package: packageName },
        ),
      )
    }

    if (sourceComponent.ftype === "simple_mosfet") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/mosfets/list", "mosfets", {
          package: packageName,
          channel_type: sourceComponent.channel_type,
          mosfet_mode: sourceComponent.mosfet_mode,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_switch") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/switches/list", "switches", {
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_led") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/leds/list", "leds", {
          package: packageName,
        }),
      )
    }

    if (sourceComponent.ftype === "simple_fuse") {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts("/fuses/list", "fuses", {
          package: packageName,
        }),
      )
    }

    if (
      sourceComponent.ftype === "simple_connector" &&
      sourceComponent.standard === "usb_c"
    ) {
      return this.toSupplierPartNumbers(
        await this.getCategoryParts(
          "/usb_c_connectors/list",
          "usb_c_connectors",
          { package: packageName },
        ),
      )
    }

    const keywordByFtype: Partial<
      Record<typeof sourceComponent.ftype, string>
    > = {
      simple_chip: "integrated circuit",
      simple_power_source: "power supply",
      simple_inductor: "inductor",
      simple_crystal: "crystal",
      simple_resonator: "resonator",
    }
    const keyword = keywordByFtype[sourceComponent.ftype]
    if (keyword) {
      return this.toSupplierPartNumbers(
        await this.getKeywordParts(
          [keyword, packageName].filter(Boolean).join(" "),
        ),
      )
    }

    return {}
  }
}
