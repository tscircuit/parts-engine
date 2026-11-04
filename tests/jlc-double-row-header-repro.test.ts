import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import type { AnySourceComponent } from "circuit-json"
import { cache, jlcPartsEngine } from "../lib/jlc-parts-engine"

const originalFetch = globalThis.fetch

const header: AnySourceComponent = {
  type: "source_component",
  ftype: "simple_pin_header",
  source_component_id: "source_component_header",
  name: "J_GPIO",
  pin_count: 16,
  gender: "male",
}

const mixedRowHeaders = [
  {
    lcsc: "7501270",
    mfr: "ZX-PZ2.54-1-16PZZ",
    pitch_mm: 2.54,
    num_rows: 1,
    num_pins: 16,
    num_pins_per_row: 16,
    gender: "male",
    is_basic: false,
  },
  {
    lcsc: "7430372",
    mfr: "DS1021-1x16SF11-B",
    pitch_mm: 2.54,
    num_rows: 1,
    num_pins: 16,
    num_pins_per_row: 16,
    gender: "male",
    is_basic: false,
  },
  {
    lcsc: "18078209",
    mfr: "BX-PZ2.54-1-16PZZ",
    pitch_mm: 2.54,
    num_rows: 1,
    num_pins: 16,
    num_pins_per_row: 16,
    gender: "male",
    is_basic: false,
  },
  {
    lcsc: "7501279",
    mfr: "ZX-PZ2.54-2-8PZZ",
    pitch_mm: 2.54,
    num_rows: 2,
    num_pins: 16,
    num_pins_per_row: 8,
    gender: "male",
    is_basic: false,
  },
]

describe("pin-header row compatibility", () => {
  let fetchCount: number

  beforeEach(() => {
    cache.clear()
    fetchCount = 0
    globalThis.fetch = (async (_url: string) => {
      fetchCount += 1
      return Response.json({
        headers: mixedRowHeaders,
      })
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    cache.clear()
  })

  test("single-row lookup returns the three compatible 1x16 headers", async () => {
    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_nopinlabels",
    })

    expect(fetchCount).toBe(1)
    expect(result).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  })

  test("double-row lookup retains the available 2x8 header before limiting candidates", async () => {
    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_nopinlabels_rows2",
    })

    expect(fetchCount).toBe(1)
    expect(result).toEqual({ jlcpcb: ["C7501279"] })
  })

  test("recognizes rows2 before pitch and other footprint options", async () => {
    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_rows2_p2.54mm_id1mm_od1.5mm",
    })

    expect(result).toEqual({ jlcpcb: ["C7501279"] })
  })

  test("single-row and double-row lookups independently filter a shared cached response", async () => {
    const doubleRowResult = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows2",
    })
    const singleRowResult = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows1",
    })

    expect(fetchCount).toBe(1)
    expect(doubleRowResult).toEqual({ jlcpcb: ["C7501279"] })
    expect(singleRowResult).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  })

  test("rejects incompatible and unknown rows even when they are basic parts", async () => {
    globalThis.fetch = (async () =>
      Response.json({
        headers: [
          { lcsc: 1, is_basic: true, num_rows: 1 },
          { lcsc: 2, is_basic: true },
          { lcsc: 3, is_basic: false, num_rows: 2 },
          { lcsc: 4, is_basic: true, num_rows: 2 },
        ],
      })) as unknown as typeof fetch

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows2",
    })

    expect(result).toEqual({ jlcpcb: ["C4", "C3"] })
  })

  test("returns no candidates when the catalog has no compatible rows", async () => {
    globalThis.fetch = (async () =>
      Response.json({
        headers: mixedRowHeaders.filter(
          (candidate) => candidate.num_rows === 1,
        ),
      })) as unknown as typeof fetch

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows2",
    })

    expect(result).toEqual({ jlcpcb: [] })
  })

  test("preserves candidate selection when the footprint row count is unknown", async () => {
    globalThis.fetch = (async () =>
      Response.json({
        headers: [{ lcsc: 1 }, { lcsc: 2 }],
      })) as unknown as typeof fetch

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
    })

    expect(result).toEqual({ jlcpcb: ["C1", "C2"] })
  })
})
