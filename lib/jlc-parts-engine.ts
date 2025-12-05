import type { PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import type { AnyCircuitElement, AnySourceComponent } from "circuit-json"
import {
  fetchEasyEDAComponent,
  convertEasyEdaJsonToCircuitJson,
  EasyEdaJsonSchema,
} from "easyeda"
import { getJlcpcbPackageName } from "./footprint-translators/index"

/**
 * Result from findStandardPart containing part info with footprint.
 * This type mirrors StandardPartResult from @tscircuit/props.
 * TODO: Import from @tscircuit/props once published.
 */
interface StandardPartResult {
  supplierPartNumbers: SupplierPartNumbers
  /**
   * Circuit JSON array describing the footprint for the selected part.
   * Pin mapping is implicit in the circuit JSON elements (e.g., pcb_smtpad, pcb_plated_hole)
   * which contain pin_number and port_hints properties.
   */
  footprint?: AnyCircuitElement[]
}

/**
 * Extended PartsEngine interface with findStandardPart method.
 * TODO: Use PartsEngine from @tscircuit/props once published.
 */
interface ExtendedPartsEngine extends PartsEngine {
  findStandardPart?: (params: {
    standard: string
    sourceComponent: AnySourceComponent
  }) => Promise<StandardPartResult | null> | StandardPartResult | null
}

export const cache = new Map<string, any>()

const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString()
  if (cache.has(paramString)) {
    return cache.get(paramString)
  }
  const response = await fetch(
    `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
  )
  const responseJson = await response.json()
  cache.set(paramString, responseJson)
  return responseJson
}

const withBasicPartPreference = (parts: any[] | undefined) => {
  if (!parts) return []
  return [...parts].sort(
    (a, b) => Number(b.is_basic ?? false) - Number(a.is_basic ?? false),
  )
}

export const jlcPartsEngine: ExtendedPartsEngine = {
  findPart: async ({
    sourceComponent,
    footprinterString,
  }): Promise<SupplierPartNumbers> => {
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
      (sourceComponent as any).ftype === "simple_connector"
    ) {
      // Handle connector components based on their standard
      const connectorStandard = (sourceComponent as any).connector_standard

      if (connectorStandard === "usb_c") {
        const { usb_c_connectors } = await getJlcPartsCached(
          "usb_c_connectors",
          {
            package: jlcpcbPackage,
          },
        )
        return {
          jlcpcb: withBasicPartPreference(usb_c_connectors)
            .map((c: any) => `C${c.lcsc}`)
            .slice(0, 3),
        }
      }

      // For other connector types or no standard specified, return empty
      return {}
    }
    return {}
  },

  /**
   * Find a standard part (e.g., USB-C connector) and return full part info.
   * The footprint is returned as Circuit JSON (AnyCircuitElement[]) when available.
   * Pin mapping is implicit in the Circuit JSON elements' port_hints properties.
   */
  findStandardPart: async ({
    standard,
    sourceComponent,
  }): Promise<StandardPartResult | null> => {
    if (standard === "usb_c") {
      const { usb_c_connectors } = await getJlcPartsCached(
        "usb_c_connectors",
        {},
      )

      if (!usb_c_connectors || usb_c_connectors.length === 0) {
        return null
      }

      // Sort by stock and preference for basic parts
      const sortedConnectors = withBasicPartPreference(usb_c_connectors)
      const selectedConnector = sortedConnectors[0]

      if (!selectedConnector) {
        return null
      }

      // Fetch the footprint from EasyEDA/JLCPCB
      // USB-C connectors don't have a standard footprint - each manufacturer's
      // connector has different physical dimensions
      let footprint: AnyCircuitElement[] | undefined
      try {
        const lcscNumber = `C${selectedConnector.lcsc}`
        const rawEasyJson = await fetchEasyEDAComponent(lcscNumber)
        // Parse the raw JSON to get the validated/processed version
        const betterEasyJson = EasyEdaJsonSchema.parse(rawEasyJson)
        const circuitJson = convertEasyEdaJsonToCircuitJson(betterEasyJson)
        footprint = circuitJson as AnyCircuitElement[]
      } catch {
        // If we can't fetch the footprint, return undefined
        // The core can fall back to a default footprint or error
        footprint = undefined
      }

      return {
        supplierPartNumbers: {
          jlcpcb: sortedConnectors.map((c: any) => `C${c.lcsc}`).slice(0, 3),
        },
        footprint,
      }
    }

    // Other standards not yet implemented
    return null
  },
}
