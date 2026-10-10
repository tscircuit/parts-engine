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
    // Intentionally fails on the current implementation: it returns the
    // same three single-row parts as the control and drops C7501279.
    expect(result).toEqual({ jlcpcb: ["C7501279"] })
  })
})
