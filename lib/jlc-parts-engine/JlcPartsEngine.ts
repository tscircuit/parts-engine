import type { PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import {
  fetchEasyEDAComponent,
  EasyEdaJsonSchema,
  convertEasyEdaJsonToCircuitJson,
} from "easyeda/browser"
import { getJlcpcbPackageName } from "../footprint-translators/index"
import { getJlcPartsCached, withBasicPartPreference } from "./jlc-parts-cache"
import type { CreateJlcPartsEngineOptions } from "./types"

export class JlcPartsEngine implements PartsEngine {
  private readonly enginePlatformFetch: CreateJlcPartsEngineOptions["platformFetch"]

  constructor(options: CreateJlcPartsEngineOptions = {}) {
    this.enginePlatformFetch = options.platformFetch
  }

  findPart(
    params: Parameters<PartsEngine["findPart"]>[0],
  ): ReturnType<PartsEngine["findPart"]> {
    return this._findPart(params)
  }

  fetchPartCircuitJson(
    params: Parameters<NonNullable<PartsEngine["fetchPartCircuitJson"]>>[0],
  ): ReturnType<NonNullable<PartsEngine["fetchPartCircuitJson"]>> {
    return this._fetchPartCircuitJson(params)
  }

  private async _findPart({
    sourceComponent,
    footprinterString,
  }: Parameters<PartsEngine["findPart"]>[0]): Promise<SupplierPartNumbers> {
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
      let pitch: number | undefined
      if (footprinterString?.includes("_p")) {
        pitch = Number(footprinterString.split("_p")[1])
      }
      const { headers } = await getJlcPartsCached(
        "headers",
        pitch
          ? {
              pitch: pitch,
              num_pins: sourceComponent.pin_count,
              gender: sourceComponent.gender,
            }
          : {
              num_pins: sourceComponent.pin_count,
              gender: sourceComponent.gender,
            },
      )
      return {
        jlcpcb: withBasicPartPreference(headers)
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
        switch_type: sourceComponent.type,
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
    }

    return {}
  }

  private async _fetchPartCircuitJson({
    supplierPartNumber,
    manufacturerPartNumber,
    platformFetch: callPlatformFetch,
  }: Parameters<NonNullable<PartsEngine["fetchPartCircuitJson"]>>[0]) {
    const easyEdaFetch =
      callPlatformFetch ?? this.enginePlatformFetch ?? globalThis.fetch
    let resolvedPartNumber = supplierPartNumber

    if (!resolvedPartNumber && manufacturerPartNumber) {
      const { components } = await getJlcPartsCached("components", {
        search: manufacturerPartNumber,
      })
      resolvedPartNumber = components?.[0]
        ? `C${components[0].lcsc}`
        : undefined
    }

    if (!resolvedPartNumber) return undefined

    const rawEasyEdaJson = await fetchEasyEDAComponent(resolvedPartNumber, {
      fetch: easyEdaFetch,
    })
    const parsed = EasyEdaJsonSchema.parse(rawEasyEdaJson)
    return convertEasyEdaJsonToCircuitJson(parsed)
  }
}
