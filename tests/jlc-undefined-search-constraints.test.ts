import { expect, test } from "bun:test"
import type { AnySourceComponent } from "circuit-json"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine"

test("undefined supplier search constraints are omitted instead of serialized", async () => {
  const fetchedUrls: string[] = []
  const engine = new JlcPcbPartsEngine({
    jlcSearchBaseUrl: "https://jlcsearch.invalid",
    platformFetch: async (input) => {
      fetchedUrls.push(String(input))
      return Response.json({
        resistors: [{ lcsc: 5139509 }],
      })
    },
  })
  const resistor: AnySourceComponent = {
    type: "source_component",
    ftype: "simple_resistor",
    resistance: 10000,
    source_component_id: "source_component_0",
    name: "R1",
  }

  const result = await engine.findPart({ sourceComponent: resistor })

  expect(result.jlcpcb).toEqual(["C5139509"])
  expect(fetchedUrls).toHaveLength(1)
  const url = new URL(fetchedUrls[0]!)
  expect(url.searchParams.get("resistance")).toBe("10000")
  expect(url.searchParams.has("package")).toBe(false)
})
