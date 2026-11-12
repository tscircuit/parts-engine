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

describe("pin-header row compatibility reproduction", () => {
  let fetchCount: number

  beforeEach(() => {
    cache.clear()
    fetchCount = 0
    globalThis.fetch = (async (_url: string) => {
      fetchCount += 1
      return Response.json({
        // Three 1x16 candidates precede an available 2x8 candidate to
        // exercise the result limit; this is not live catalog ordering.
        headers: [
          { lcsc: "7501270", num_rows: 1 },
          { lcsc: "7430372", num_rows: 1 },
          { lcsc: "18078209", num_rows: 1 },
          { lcsc: "7501279", num_rows: 2 },
        ],
      })
    }) as typeof fetch
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

  test.failing(
    "double-row lookup retains the available 2x8 header before limiting candidates",
    async () => {
      const result = await jlcPartsEngine.findPart({
        sourceComponent: header,
        footprinterString: "pinrow16_p2.54_nopinlabels_rows2",
      })

      expect(fetchCount).toBe(1)
      // Known failure tracked with test.failing: the implementation returns the
      // same three single-row parts as the control and drops C7501279.
      expect(result).toEqual({ jlcpcb: ["C7501279"] })
    },
  )
})
