import { afterEach, expect, test } from "bun:test"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine/JlcPartsEngine"
import { cache } from "../lib/jlc-parts-engine/jlc-parts-cache"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  cache.clear()
})

test.each([false, true])(
  "same-package diode and chip lookups keep separate cached results (chip first: %s)",
  async (chipFirst) => {
    cache.clear()
    const requestedPaths: string[] = []
    globalThis.fetch = Object.assign(
      async (input: Parameters<typeof fetch>[0]) => {
        const requestUrl = new URL(
          input instanceof Request ? input.url : String(input),
        )
        requestedPaths.push(requestUrl.pathname)
        if (requestUrl.pathname === "/diodes/list") {
          return Response.json({ diodes: [{ lcsc: 111 }] })
        }
        if (requestUrl.pathname === "/chips/list") {
          return Response.json({ chips: [{ lcsc: 222 }] })
        }
        throw new Error(`Unexpected request: ${requestUrl}`)
      },
      { preconnect: originalFetch.preconnect },
    )
    const engine = new JlcPcbPartsEngine()
    const diode = {
      sourceComponent: {
        type: "source_component" as const,
        source_component_id: "source_component_diode",
        name: "D1",
        ftype: "simple_diode" as const,
      },
      footprinterString: "SOT-23",
    }
    const chip = {
      sourceComponent: {
        type: "source_component" as const,
        source_component_id: "source_component_chip",
        name: "U1",
        ftype: "simple_chip" as const,
      },
      footprinterString: "SOT-23",
    }
    const lookups = chipFirst ? [chip, diode] : [diode, chip]
    const expectedParts = chipFirst ? ["C222", "C111"] : ["C111", "C222"]

    for (let pass = 0; pass < 2; pass++) {
      const results = []
      for (const lookup of lookups) {
        results.push(await engine.findPart(lookup))
      }
      expect(results).toEqual(expectedParts.map((part) => ({ jlcpcb: [part] })))
    }
    expect(requestedPaths).toEqual(
      chipFirst
        ? ["/chips/list", "/diodes/list"]
        : ["/diodes/list", "/chips/list"],
    )
    expect(cache.size).toBe(2)
  },
)
