import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type Mock,
  spyOn,
  test,
} from "bun:test"
import type { AnySourceComponent } from "circuit-json"
import { cache, jlcPartsEngine } from "../lib/jlc-parts-engine"
import headers from "./fixtures/headers-16pin-mixed-rows.json"

const header: AnySourceComponent = {
  type: "source_component",
  ftype: "simple_pin_header",
  source_component_id: "source_component_header",
  name: "J_GPIO",
  pin_count: 16,
  gender: "male",
}

describe("pin-header row compatibility reproduction", () => {
  let fetchSpy: Mock<typeof fetch>

  beforeEach(() => {
    cache.clear()
    // Reduced real catalog records, deliberately ordered with three 1x16
    // candidates before an available 2x8 candidate to exercise the result limit.
    // This is a deterministic fixture, not a snapshot of live API ordering.
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ headers }),
    )
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    cache.clear()
  })

  test("single-row lookup returns the three compatible 1x16 headers", async () => {
    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_nopinlabels",
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  })

  test("double-row lookup retains the available 2x8 header before limiting candidates", async () => {
    // The response contains a matching part, so its absence from findPart's
    // result cannot be attributed to missing two-row inventory.
    expect(
      headers
        .filter((candidate) => candidate.num_rows === 2)
        .map((candidate) => `C${candidate.lcsc}`),
    ).toEqual(["C7501279"])

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_nopinlabels_rows2",
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
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

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(doubleRowResult).toEqual({ jlcpcb: ["C7501279"] })
    expect(singleRowResult).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  })

  test("rejects incompatible and unknown rows even when they are basic parts", async () => {
    fetchSpy.mockResolvedValue(
      Response.json({
        headers: [
          { lcsc: 1, is_basic: true, num_rows: 1 },
          { lcsc: 2, is_basic: true },
          { lcsc: 3, is_basic: false, num_rows: 2 },
          { lcsc: 4, is_basic: true, num_rows: 2 },
        ],
      }),
    )

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows2",
    })

    expect(result).toEqual({ jlcpcb: ["C4", "C3"] })
  })

  test("returns no candidates when the catalog has no compatible rows", async () => {
    fetchSpy.mockResolvedValue(
      Response.json({
        headers: headers.filter((candidate) => candidate.num_rows === 1),
      }),
    )

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54_rows2",
    })

    expect(result).toEqual({ jlcpcb: [] })
  })

  test("preserves candidate selection when the footprint row count is unknown", async () => {
    fetchSpy.mockResolvedValue(
      Response.json({ headers: [{ lcsc: 1 }, { lcsc: 2 }] }),
    )

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
    })

    expect(result).toEqual({ jlcpcb: ["C1", "C2"] })
  })
})
