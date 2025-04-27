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
      if (url.includes("/headers/")) {
        return {
          json: async () => ({
            headers: [{ lcsc: "3456" }, { lcsc: "7890" }, { lcsc: "1234" }],
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
      footprinterString: "0603cap",
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
})
