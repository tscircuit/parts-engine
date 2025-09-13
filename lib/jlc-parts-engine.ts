import type { PartsEngine, SupplierPartNumbers } from "@tscircuit/props"

const cache = new Map<string, any>()

const getIsBasic = (p: any): boolean =>
  p?.isBasic === true || p?.basic === true || p?.basic === 1

const sortBasicFirst = <T extends Record<string, any>>(arr: T[]): T[] =>
  arr.slice().sort((a, b) => {
    const aBasic = getIsBasic(a)
    const bBasic = getIsBasic(b)
    if (aBasic === bBasic) return 0
    return aBasic ? -1 : 1
  })

const getJlcPartsCached = async (name: string, params: any) => {
  const paramString = new URLSearchParams({
    ...params,
    json: "true",
  }).toString()

  const cacheKey = `${name}?${paramString}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const response = await fetch(
    `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
  )
  const responseJson = await response.json()

  cache.set(cacheKey, responseJson)
  return responseJson
}

export const jlcPartsEngine: PartsEngine = {
  findPart: async ({
    sourceComponent,
    footprinterString,
  }): Promise<SupplierPartNumbers> => {
    if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_resistor"
    ) {
      const { resistors } = await getJlcPartsCached("resistors", {
        resistance: sourceComponent.resistance,
        package: footprinterString,
      })

      const chosen = sortBasicFirst(resistors ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((r: any) => `C${r.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_capacitor"
    ) {
      let pkg = footprinterString
      if (pkg?.includes("cap")) {
        pkg = pkg.replace("cap", "")
      }
      const { capacitors } = await getJlcPartsCached("capacitors", {
        capacitance: sourceComponent.capacitance,
        package: pkg,
      })

      const chosen = sortBasicFirst(capacitors ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((c: any) => `C${c.lcsc}`),
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
      const chosen = sortBasicFirst(headers ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((h: any) => `C${h.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_potentiometer"
    ) {
      const { potentiometers } = await getJlcPartsCached("potentiometers", {
        resistance: sourceComponent.max_resistance,
        package: footprinterString,
      })
      const chosen = sortBasicFirst(potentiometers ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((p: any) => `C${p.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_diode"
    ) {
      const { diodes } = await getJlcPartsCached("diodes", {
        package: footprinterString,
      })
      const chosen = sortBasicFirst(diodes ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((d: any) => `C${d.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_chip"
    ) {
      const { chips } = await getJlcPartsCached("chips", {
        package: footprinterString,
      })
      const chosen = sortBasicFirst(chips ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((c: any) => `C${c.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_transistor"
    ) {
      const { transistors } = await getJlcPartsCached("transistors", {
        package: footprinterString,
        transistor_type: sourceComponent.transistor_type,
        channel_type: sourceComponent.channel_type,
      })
      const chosen = sortBasicFirst(transistors ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((t: any) => `C${t.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_power_source"
    ) {
      const { power_sources } = await getJlcPartsCached("power_sources", {
        voltage: sourceComponent.voltage,
        package: footprinterString,
      })
      const chosen = sortBasicFirst(power_sources ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((p: any) => `C${p.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_inductor"
    ) {
      const { inductors } = await getJlcPartsCached("inductors", {
        inductance: sourceComponent.inductance,
        package: footprinterString,
      })
      const chosen = sortBasicFirst(inductors ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((i: any) => `C${i.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_crystal"
    ) {
      const { crystals } = await getJlcPartsCached("crystals", {
        frequency: sourceComponent.frequency,
        load_capacitance: sourceComponent.load_capacitance,
        package: footprinterString,
      })
      const chosen = sortBasicFirst(crystals ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((c: any) => `C${c.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_mosfet"
    ) {
      const { mosfets } = await getJlcPartsCached("mosfets", {
        package: footprinterString,
        mosfet_mode: sourceComponent.mosfet_mode,
        channel_type: sourceComponent.channel_type,
      })
      const chosen = sortBasicFirst(mosfets ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((m: any) => `C${m.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_resonator"
    ) {
      const { resonators } = await getJlcPartsCached("resonators", {
        frequency: sourceComponent.frequency,
        package: footprinterString,
      })
      const chosen = sortBasicFirst(resonators ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((r: any) => `C${r.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_switch"
    ) {
      const { switches } = await getJlcPartsCached("switches", {
        // Note: sourceComponent.type is "source_component", so we don't pass it as switch_type
        package: footprinterString,
      })
      const chosen = sortBasicFirst(switches ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((s: any) => `C${s.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_led"
    ) {
      const { leds } = await getJlcPartsCached("leds", {
        package: footprinterString,
      })
      const chosen = sortBasicFirst(leds ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((l: any) => `C${l.lcsc}`),
      }
    } else if (
      sourceComponent.type === "source_component" &&
      sourceComponent.ftype === "simple_fuse"
    ) {
      const { fuses } = await getJlcPartsCached("fuses", {
        package: footprinterString,
      })
      const chosen = sortBasicFirst(fuses ?? []).slice(0, 3)
      return {
        jlcpcb: chosen.map((l: any) => `C${l.lcsc}`),
      }
    }
    return {}
  },
}