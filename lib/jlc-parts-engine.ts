import type { PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import { getJlcpcbPackageName } from "./footprint-translators/index"

/**
 * Result from findStandardPart containing part info with footprint.
 * This type will be moved to @tscircuit/props once that PR is merged.
 */
interface StandardPartResult {
  supplierPartNumbers: SupplierPartNumbers
  footprint?: string
  pinMapping?: Record<string, number | string>
}

/**
 * Extended PartsEngine interface with findStandardPart method.
 * This will be merged into @tscircuit/props.
 */
interface ExtendedPartsEngine extends PartsEngine {
  findStandardPart?: (params: {
    standard: string
    sourceComponent: any
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
   * Find a standard part (e.g., USB-C connector) and return full part info
   * including footprint and pin mapping.
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

      // Determine footprint based on number of contacts
      const pinCount = selectedConnector.number_of_contacts || 16
      const packageType = selectedConnector.package || "SMD"
      const footprint = `usb_c_${pinCount}pin_${packageType.toLowerCase()}`

      // USB-C standard pin mapping for a typical 16-pin connector
      // This maps standard USB-C signal names to typical physical pin numbers
      // Note: Actual mapping may vary by specific connector model
      const pinMapping: Record<string, number> = {
        // USB 2.0 data
        DP: 1,
        DM: 2,
        // Configuration Channel
        CC1: 3,
        CC2: 4,
        // VBUS (power)
        VBUS1: 5,
        VBUS2: 6,
        VBUS3: 7,
        VBUS4: 8,
        // Ground
        GND1: 9,
        GND2: 10,
        GND3: 11,
        GND4: 12,
        // Sideband Use
        SBU1: 13,
        SBU2: 14,
        // Shield
        SHIELD: 15,
      }

      return {
        supplierPartNumbers: {
          jlcpcb: sortedConnectors.map((c: any) => `C${c.lcsc}`).slice(0, 3),
        },
        footprint,
        pinMapping,
      }
    }

    // Other standards not yet implemented
    return null
  },
}
