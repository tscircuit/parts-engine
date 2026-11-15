import { afterEach, expect, test } from "bun:test"
import { getJlcpcbPackageName } from "../lib/footprint-translators"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine/JlcPartsEngine"
import { cache } from "../lib/jlc-parts-engine/jlc-parts-cache"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  cache.clear()
})

test.each([
  ["kicad:Package_TO_SOT_SMD:SOT-23-5", "SOT-23-5"],
  ["kicad:Package_TO_SOT_SMD:SOT-23-6", "SOT-23-6"],
  ["kicad:Package_TO_SOT_SMD:SOT-23-5_HandSoldering", "SOT-23-5"],
  ["kicad:Package_TO_SOT_SMD:SOT-23", "SOT-23"],
  ["kicad:Package_SO:SOIC-8_3.9x4.9mm_P1.27mm", "SOIC-8"],
])("maps %s to %s", (footprint, expectedPackage) => {
  expect(getJlcpcbPackageName(footprint)).toBe(expectedPackage)
})

test("findPart searches the five-pin package instead of the base SOT-23", async () => {
  cache.clear()
  const requestedPackages: Array<string | null> = []
  globalThis.fetch = Object.assign(
    async (input: Parameters<typeof fetch>[0]) => {
      const requestUrl = new URL(
        input instanceof Request ? input.url : String(input),
      )
      const requestedPackage = requestUrl.searchParams.get("package")
      requestedPackages.push(requestedPackage)
      return Response.json({
        chips: [{ lcsc: requestedPackage === "SOT-23-5" ? 123 : 456 }],
      })
    },
    { preconnect: originalFetch.preconnect },
  )
  const result = await new JlcPcbPartsEngine().findPart({
    sourceComponent: {
      type: "source_component",
      source_component_id: "source_component_0",
      name: "U1",
      ftype: "simple_chip",
    },
    footprinterString: "kicad:Package_TO_SOT_SMD:SOT-23-5",
  })
  expect(requestedPackages).toEqual(["SOT-23-5"])
  expect(result).toEqual({ jlcpcb: ["C123"] })
})
