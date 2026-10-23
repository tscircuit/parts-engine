import { afterEach, expect, mock, test } from "bun:test"
import type { SourceSimplePinHeader } from "circuit-json"
import { cache, JlcPcbPartsEngine } from "../lib/jlc-parts-engine"

const header: SourceSimplePinHeader = {
  type: "source_component",
  ftype: "simple_pin_header",
  source_component_id: "source_component_header",
  name: "J_GPIO",
  pin_count: 16,
  gender: "male",
}

const catalogHeaders = [
  { lcsc: "7501270", num_rows: 1, is_basic: true },
  { lcsc: "7430372", num_rows: 1 },
  { lcsc: "18078209", num_rows: 1 },
  { lcsc: "7501279", num_rows: 2 },
]

function createHeaderEngine(headers = catalogHeaders) {
  const platformFetch = mock(async () => Response.json({ headers }))
  return {
    engine: new JlcPcbPartsEngine({ platformFetch }),
    platformFetch,
  }
}

afterEach(() => cache.clear())

test.each([
  "pinrow16_p2.54_nopinlabels_rows2",
  "pinrow16_rows2_p2.54mm_id1mm_od1.5mm",
])(
  "%s selects the 2x8 header before ranking and limiting candidates",
  async (footprinterString) => {
    const { engine } = createHeaderEngine()
    expect(
      await engine.findPart({ sourceComponent: header, footprinterString }),
    ).toEqual({
      jlcpcb: ["C7501279"],
    })
  },
)

test.each(["pinrow16_p2.54_nopinlabels", "pinrow16_rows1_p2.54"])(
  "%s rejects two-row parts for a single-row footprint",
  async (footprinterString) => {
    const { engine } = createHeaderEngine([
      { lcsc: "7501279", num_rows: 2, is_basic: true },
      ...catalogHeaders.slice(0, 3),
    ])
    expect(
      await engine.findPart({ sourceComponent: header, footprinterString }),
    ).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  },
)

test.each([undefined, "custom_rows2", "kicad:Connector_Custom:Header_rows2"])(
  "unknown footprint %s does not impose a row count",
  async (footprinterString) => {
    const { engine } = createHeaderEngine()
    expect(
      await engine.findPart({ sourceComponent: header, footprinterString }),
    ).toEqual({
      jlcpcb: ["C7501270", "C7430372", "C18078209"],
    })
  },
)

test("row filtering leaves the shared cached catalog unchanged", async () => {
  const { engine, platformFetch } = createHeaderEngine()
  const doubleRowRequest = {
    sourceComponent: header,
    footprinterString: "pinrow16_p2.54_rows2",
  }
  expect(await engine.findPart(doubleRowRequest)).toEqual({
    jlcpcb: ["C7501279"],
  })
  expect(
    await engine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_p2.54",
    }),
  ).toEqual({
    jlcpcb: ["C7501270", "C7430372", "C18078209"],
  })
  expect(await engine.findPart(doubleRowRequest)).toEqual({
    jlcpcb: ["C7501279"],
  })
  expect(platformFetch).toHaveBeenCalledTimes(1)
})

test("no matching rows returns no candidates instead of incompatible headers", async () => {
  const { engine } = createHeaderEngine(catalogHeaders.slice(0, 3))
  expect(
    await engine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow16_rows2",
    }),
  ).toEqual({ jlcpcb: [] })
})
