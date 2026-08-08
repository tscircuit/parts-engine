import { afterEach, describe, expect, it } from "bun:test"
import { MouserPartsEngine, mouserCache } from "../lib/mouser-parts-engine"

afterEach(() => mouserCache.clear())

describe("MouserPartsEngine", () => {
  it("maps resistor constraints to the compatible Mouser category route", async () => {
    const requests: URL[] = []
    const engine = new MouserPartsEngine({
      apiBaseUrl: "https://mouser.example.test",
      platformFetch: async (input) => {
        requests.push(new URL(String(input)))
        return new Response(
          JSON.stringify({
            resistors: [
              {
                mouser_product_number: "LOW-STOCK-ND",
                mfr: "LOW",
                stock: 10,
              },
              {
                mouser_product_number: "HIGH-STOCK-ND",
                mfr: "HIGH",
                stock: 1000,
                normally_stocking: true,
              },
            ],
          }),
          { status: 200 },
        )
      },
    })

    const result = await engine.findPart({
      sourceComponent: {
        type: "source_component",
        source_component_id: "source_component_0",
        name: "R1",
        ftype: "simple_resistor",
        resistance: 10_000,
      },
      footprinterString: "0402",
    })

    expect(result).toEqual({
      mouser: ["HIGH-STOCK-ND", "LOW-STOCK-ND"],
    })
    expect(requests).toHaveLength(1)
    const request = requests[0]
    if (!request) throw new Error("Expected one Mouser search request")
    expect(request.pathname).toBe("/resistors/list")
    expect(request.searchParams.get("resistance")).toBe("10000")
    expect(request.searchParams.get("package")).toBe("0402")
    expect(request.searchParams.get("json")).toBe("true")
  })

  it("caches identical lookups in-process", async () => {
    let calls = 0
    const engine = new MouserPartsEngine({
      apiBaseUrl: "https://mouser.example.test",
      platformFetch: async () => {
        calls += 1
        return new Response(JSON.stringify({ leds: [] }), { status: 200 })
      },
    })
    const params = {
      sourceComponent: {
        type: "source_component" as const,
        source_component_id: "source_component_0",
        name: "D1",
        ftype: "simple_led" as const,
        color: "red",
      },
      footprinterString: "0603",
    }

    await engine.findPart(params)
    await engine.findPart(params)
    expect(calls).toBe(1)
  })
})
