import { afterEach, expect, mock, test } from "bun:test"
import {
  cache,
  JlcPcbPartsEngine,
  type PlatformFetch,
} from "../lib/jlc-parts-engine"
import rawPart from "./fixtures/C7496818.raweasy.json"

afterEach(() => cache.clear())

test("repro: manufacturer lookup imports an unrelated LED without an exact match", async () => {
  const manufacturerPartNumber = "TYPE-C-31-M-12"
  const platformFetch = mock<PlatformFetch>(async (input, init) => {
    const url = String(input)
    if (
      url ===
      `https://jlcsearch.tscircuit.com/components/list?${new URLSearchParams({ search: manufacturerPartNumber, json: "true" })}`
    ) {
      // First result recorded on 2026-10-28; none of the 100 results matched.
      // Retain that row to isolate parts-engine's fallback from live search.
      return Response.json({
        components: [
          { mfr: "F.0603.00025/P2-0603G1TS2-06T-002", lcsc: 7496818 },
        ],
      })
    }
    if (url === "https://easyeda.com/api/components/search") {
      expect(new URLSearchParams(String(init?.body)).get("wd")).toBe("C7496818")
      return Response.json({
        success: true,
        result: {
          lists: { lcsc: [{ uuid: rawPart.uuid, dataStr: rawPart.dataStr }] },
        },
      })
    }
    if (url.startsWith(`https://easyeda.com/api/components/${rawPart.uuid}?`)) {
      // Public EasyEDA detail response for C7496818, recorded on 2026-10-28.
      return Response.json({ success: true, result: rawPart })
    }
    if (
      url.startsWith(
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C7496818.obj",
      )
    ) {
      return new Response(null, { status: 404 })
    }
    throw new Error(`Unexpected fixture request: ${url}`)
  })
  const engine = new JlcPcbPartsEngine({ platformFetch })
  const circuitJson = await engine.fetchPartCircuitJson({
    manufacturerPartNumber,
  })

  expect(circuitJson).toBeDefined()
  const sourceComponent = circuitJson?.find(
    (element) => element.type === "source_component",
  )

  // This snapshot records the bug, not the desired behavior: a USB-C request
  // returns a two-pad LED. A fix should update this same reproduction.
  expect({
    requestedManufacturerPartNumber: manufacturerPartNumber,
    importedManufacturerPartNumber: sourceComponent?.manufacturer_part_number,
    smtPadCount: circuitJson?.filter((element) => element.type === "pcb_smtpad")
      .length,
    platedHoleCount: circuitJson?.filter(
      (element) => element.type === "pcb_plated_hole",
    ).length,
  }).toMatchInlineSnapshot(`
    {
      "importedManufacturerPartNumber": "F.0603.00025/P2-0603G1TS2-06T-002",
      "platedHoleCount": 0,
      "requestedManufacturerPartNumber": "TYPE-C-31-M-12",
      "smtPadCount": 2,
    }
  `)
})
