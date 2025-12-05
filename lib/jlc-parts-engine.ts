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

/**
 * USB-C standard pin mapping.
 * Maps various manufacturer pin naming conventions to standard USB-C pin names.
 * USB Type-C has 24 pins with specific designations (A1-A12, B1-B12).
 */
const USB_C_PIN_MAPPING: Record<string, string> = {
  // USB 2.0 Data pins (D+/D-) - typically on A6/B6 and A7/B7
  A6: "DP",
  B6: "DP",
  A7: "DM",
  B7: "DM",
  "D+": "DP",
  "D-": "DM",
  DP1: "DP",
  DM1: "DM",
  DP2: "DP",
  DM2: "DM",
  DN1: "DM",
  DN2: "DM",

  // Configuration Channel (CC1/CC2) - A5 and B5
  A5: "CC1",
  B5: "CC2",
  CC: "CC1",

  // VBUS pins - A4, A9, B4, B9
  A4: "VBUS1",
  A9: "VBUS2",
  B4: "VBUS3",
  B9: "VBUS4",
  VBUS: "VBUS1",

  // Ground pins - A1, A12, B1, B12
  A1: "GND1",
  A12: "GND2",
  B1: "GND3",
  B12: "GND4",
  GND: "GND1",

  // Sideband Use (SBU1/SBU2) - A8 and B8
  A8: "SBU1",
  B8: "SBU2",
  SBU: "SBU1",

  // SuperSpeed TX pairs - A2/A3 and B2/B3
  A2: "TX1_PLUS",
  A3: "TX1_MINUS",
  B2: "TX2_PLUS",
  B3: "TX2_MINUS",
  "TX1+": "TX1_PLUS",
  "TX1-": "TX1_MINUS",
  "TX2+": "TX2_PLUS",
  "TX2-": "TX2_MINUS",
  SSTXP1: "TX1_PLUS",
  SSTXN1: "TX1_MINUS",
  SSTXP2: "TX2_PLUS",
  SSTXN2: "TX2_MINUS",

  // SuperSpeed RX pairs - A10/A11 and B10/B11
  A10: "RX1_MINUS",
  A11: "RX1_PLUS",
  B10: "RX2_MINUS",
  B11: "RX2_PLUS",
  "RX1+": "RX1_PLUS",
  "RX1-": "RX1_MINUS",
  "RX2+": "RX2_PLUS",
  "RX2-": "RX2_MINUS",
  SSRXP1: "RX1_PLUS",
  SSRXN1: "RX1_MINUS",
  SSRXP2: "RX2_PLUS",
  SSRXN2: "RX2_MINUS",

  // Shield/Shell
  SHELL: "SHIELD",
  SH: "SHIELD",
  SHLD: "SHIELD",
  S: "SHIELD",
  S1: "SHIELD",
  S2: "SHIELD",
  S3: "SHIELD",
  S4: "SHIELD",
}

/**
 * Normalize a pin name to USB-C standard naming.
 * Handles case-insensitive matching and various manufacturer conventions.
 */
function normalizeUsbCPinName(pinName: string): string {
  const upperName = pinName.toUpperCase().trim()

  // Direct match in mapping
  if (USB_C_PIN_MAPPING[upperName]) {
    return USB_C_PIN_MAPPING[upperName]
  }

  // Check if it's already a standard name
  const standardNames = [
    "DP",
    "DM",
    "CC1",
    "CC2",
    "VBUS1",
    "VBUS2",
    "VBUS3",
    "VBUS4",
    "GND1",
    "GND2",
    "GND3",
    "GND4",
    "SBU1",
    "SBU2",
    "TX1_PLUS",
    "TX1_MINUS",
    "TX2_PLUS",
    "TX2_MINUS",
    "RX1_PLUS",
    "RX1_MINUS",
    "RX2_PLUS",
    "RX2_MINUS",
    "VCONN",
    "SHIELD",
  ]
  if (standardNames.includes(upperName)) {
    return upperName
  }

  // Return original if no mapping found
  return pinName
}

/**
 * Apply USB-C pin mapping to footprint Circuit JSON elements.
 * Updates port_hints in pcb_smtpad and pcb_plated_hole elements.
 */
function applyUsbCPinMapping(
  circuitJson: AnyCircuitElement[],
): AnyCircuitElement[] {
  return circuitJson.map((element) => {
    if (element.type === "pcb_smtpad" || element.type === "pcb_plated_hole") {
      const portHints = (element as any).port_hints as string[] | undefined
      if (portHints && Array.isArray(portHints)) {
        const normalizedHints = portHints.map((hint) =>
          normalizeUsbCPinName(hint),
        )
        // Add both original and normalized hints for compatibility
        const allHints = [...new Set([...normalizedHints, ...portHints])]
        return {
          ...element,
          port_hints: allHints,
        }
      }
    }
    return element
  }) as AnyCircuitElement[]
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
        // Apply USB-C pin mapping to normalize manufacturer pin names to standard names
        footprint = applyUsbCPinMapping(circuitJson as AnyCircuitElement[])
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
