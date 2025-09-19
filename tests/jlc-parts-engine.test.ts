import { describe, test, expect, beforeEach } from "bun:test"
import { jlcPartsEngine } from "../lib/jlc-parts-engine"
import type { AnySourceComponent } from "circuit-json"
describe("jlcPartsEngine", () => {
  beforeEach(() => {
    // Reset fetch fake between tests
    globalThis.fetch = (async (url: string) => {
      if (url.includes("/resistors/")) {
        return {
          json: async () => ({
            resistors: [{ lcsc: "1234" }, { lcsc: "5678" }, { lcsc: "9012" }],
          }),
        } as Response
      }
      if (url.includes("/capacitors/")) {
        return {
          json: async () => ({
            capacitors: [{ lcsc: "2345" }, { lcsc: "6789" }, { lcsc: "0123" }],
          }),
        } as Response
      }
      if (url.includes("/potentiometers/")) {
        return {
          json: async () => ({
            potentiometers: [
              { lcsc: "1234" },
              { lcsc: "5678" },
              { lcsc: "9012" },
            ],
          }),
        } as Response
      }
      if (url.includes("/headers/")) {
        return {
          json: async () => ({
            headers: [{ lcsc: "3456" }, { lcsc: "7890" }, { lcsc: "1234" }],
          }),
        } as Response
      }
      if (url.includes("/diodes/")) {
        return {
          json: async () => ({
            diodes: [{ lcsc: "4567" }, { lcsc: "8901" }, { lcsc: "2345" }],
          }),
        } as Response
      }
      if (url.includes("/chips/")) {
        return {
          json: async () => ({
            chips: [{ lcsc: "5678" }, { lcsc: "9012" }, { lcsc: "3456" }],
          }),
        } as Response
      }
      if (url.includes("/transistors/")) {
        return {
          json: async () => ({
            transistors: [{ lcsc: "6789" }, { lcsc: "0123" }, { lcsc: "4567" }],
          }),
        } as Response
      }
      if (url.includes("/power_sources/")) {
        return {
          json: async () => ({
            power_sources: [
              { lcsc: "7890" },
              { lcsc: "1234" },
              { lcsc: "5678" },
            ],
          }),
        } as Response
      }
      if (url.includes("/inductors/")) {
        return {
          json: async () => ({
            inductors: [{ lcsc: "8901" }, { lcsc: "2345" }, { lcsc: "6789" }],
          }),
        } as Response
      }
      if (url.includes("/crystals/")) {
        return {
          json: async () => ({
            crystals: [{ lcsc: "9012" }, { lcsc: "3456" }, { lcsc: "7890" }],
          }),
        } as Response
      }
      if (url.includes("/mosfets/")) {
        return {
          json: async () => ({
            mosfets: [{ lcsc: "0123" }, { lcsc: "4567" }, { lcsc: "8901" }],
          }),
        } as Response
      }
      if (url.includes("/resonators/")) {
        return {
          json: async () => ({
            resonators: [{ lcsc: "1234" }, { lcsc: "5678" }, { lcsc: "9012" }],
          }),
        } as Response
      }
      if (url.includes("/switches/")) {
        return {
          json: async () => ({
            switches: [{ lcsc: "2345" }, { lcsc: "6789" }, { lcsc: "0123" }],
          }),
        } as Response
      }
      return {} as Response
    }) as unknown as typeof fetch
  })

  test("should find resistor parts", async () => {
    const resistor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_resistor",
      resistance: 10000,
      source_component_id: "source_component_0",
      name: "R1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: resistor,
      footprinterString: "0603",
    })

    expect(result).toEqual({
      jlcpcb: ["C1234", "C5678", "C9012"],
    })
  })

  test("should find resistor parts with kicad footprint", async () => {
    const resistor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_resistor",
      resistance: 10000,
      source_component_id: "source_component_0",
      name: "R1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: resistor,
      footprinterString: "kicad:Resistor_SMD:R_0603_1608Metric",
    })

    expect(result).toEqual({
      jlcpcb: ["C1234", "C5678", "C9012"],
    })
  })

  test("should find capacitor parts", async () => {
    const capacitor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_capacitor",
      capacitance: 100000,
      source_component_id: "source_component_0",
      name: "C1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: capacitor,
      footprinterString: "cap0603",
    })

    expect(result).toEqual({
      jlcpcb: ["C2345", "C6789", "C0123"],
    })
  })

  test("should find pin header parts", async () => {
    const header: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_pin_header",
      pin_count: 8,
      gender: "male",
      source_component_id: "source_component_0",
      name: "J1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "2x4_p2.54",
    })

    expect(result).toEqual({
      jlcpcb: ["C3456", "C7890", "C1234"],
    })
  })

  // potentiometers
  test("should find potentiometers", async () => {
    const potentiometer: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_potentiometer",
      source_component_id: "source_component_0",
      name: "P1",
      max_resistance: 10000,
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: potentiometer,
      footprinterString: "10k",
    })

    expect(result).toEqual({
      jlcpcb: ["C1234", "C5678", "C9012"],
    })
  })

  test("should find diode parts", async () => {
    const diode: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_diode",
      source_component_id: "source_component_0",
      name: "D1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: diode,
      footprinterString: "SOD-123",
    })

    expect(result).toEqual({
      jlcpcb: ["C4567", "C8901", "C2345"],
    })
  })

  test("should find chip parts", async () => {
    const chip: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_chip",
      source_component_id: "source_component_0",
      name: "U1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: chip,
      footprinterString: "SOIC-8",
    })

    expect(result).toEqual({
      jlcpcb: ["C5678", "C9012", "C3456"],
    })
  })

  test("should find chip parts with kicad footprint", async () => {
    const chip: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_chip",
      source_component_id: "source_component_0",
      name: "U1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: chip,
      footprinterString: "kicad:Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
    })

    expect(result).toEqual({
      jlcpcb: ["C5678", "C9012", "C3456"],
    })
  })

  test("should find transistor parts", async () => {
    const transistor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_transistor",
      transistor_type: "npn",
      source_component_id: "source_component_0",
      name: "Q1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: transistor,
      footprinterString: "SOT-23",
    })

    expect(result).toEqual({
      jlcpcb: ["C6789", "C0123", "C4567"],
    })
  })

  test("should find power source parts", async () => {
    const powerSource: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_power_source",
      voltage: 5,
      source_component_id: "source_component_0",
      name: "V1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: powerSource,
      footprinterString: "SOT-223",
    })

    expect(result).toEqual({
      jlcpcb: ["C7890", "C1234", "C5678"],
    })
  })

  test("should find inductor parts", async () => {
    const inductor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_inductor",
      inductance: 100,
      source_component_id: "source_component_0",
      name: "L1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: inductor,
      footprinterString: "0603",
    })

    expect(result).toEqual({
      jlcpcb: ["C8901", "C2345", "C6789"],
    })
  })

  test("should find crystal parts", async () => {
    const crystal: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_crystal",
      frequency: 16000000,
      load_capacitance: 20,
      source_component_id: "source_component_0",
      name: "X1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: crystal,
      footprinterString: "HC-49S",
    })

    expect(result).toEqual({
      jlcpcb: ["C9012", "C3456", "C7890"],
    })
  })

  test("should find MOSFET parts", async () => {
    const mosfet: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_mosfet",
      mosfet_mode: "enhancement",
      channel_type: "n",
      source_component_id: "source_component_0",
      name: "M1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: mosfet,
      footprinterString: "SOT-23",
    })

    expect(result).toEqual({
      jlcpcb: ["C0123", "C4567", "C8901"],
    })
  })

  test("should find resonator parts", async () => {
    const resonator: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_resonator",
      frequency: 16000000,
      load_capacitance: 20,
      source_component_id: "source_component_0",
      name: "Y1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: resonator,
      footprinterString: "SMD",
    })

    expect(result).toEqual({
      jlcpcb: ["C1234", "C5678", "C9012"],
    })
  })

  test("should find switch parts", async () => {
    const switch_: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_switch",
      source_component_id: "source_component_0",
      name: "SW1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: switch_,
      footprinterString: "SMD",
    })

    expect(result).toEqual({
      jlcpcb: ["C2345", "C6789", "C0123"],
    })
  })

  test("should return empty object for unknown component types", async () => {
    const unknown: AnySourceComponent = {
      type: "source_component",
      ftype: "random" as any,
      source_component_id: "source_component_0",
      name: "U1",
      resistance: 10000,
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: unknown,
      footprinterString: "",
    })

    expect(result).toEqual({})
  })

  test("should handle missing API data", async () => {
    globalThis.fetch = (async () => ({
      json: async () => ({}),
    })) as unknown as typeof fetch

    const resistor: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_resistor",
      resistance: 1000,
      source_component_id: "source_component_0",
      name: "R2",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: resistor,
      footprinterString: "0603",
    })

    expect(result).toEqual({ jlcpcb: [] })
  })
})
