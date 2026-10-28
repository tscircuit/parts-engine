import { afterEach, expect, mock, test } from "bun:test"
import {
  cache,
  JlcPcbPartsEngine,
  type PlatformFetch,
} from "../lib/jlc-parts-engine"
import rawPart from "./fixtures/C42401279.raweasy.json"

afterEach(() => cache.clear())

test("repro: TTP223-BA6 manufacturer lookup imports an unrelated MOSFET", async () => {
  const manufacturerPartNumber = "TTP223-BA6"
  const platformFetch = mock<PlatformFetch>(async (input, init) => {
    const url = String(input)
    if (
      url ===
      `https://jlcsearch.tscircuit.com/components/list?${new URLSearchParams({ search: manufacturerPartNumber, json: "true" })}`
    ) {
      // Recorded on 2026-10-28: the only result for the wristband touch sensor.
      // https://tscircuit.com/gokul/flex-led-wristband (U3, TTP223-BA6)
      return Response.json({
        components: [{ mfr: "HAOT10N65", lcsc: 42401279 }],
      })
    }
    if (url === "https://easyeda.com/api/components/search") {
      expect(new URLSearchParams(String(init?.body)).get("wd")).toBe(
        "C42401279",
      )
      return Response.json({
        success: true,
        result: {
          lists: { lcsc: [{ uuid: rawPart.uuid, dataStr: rawPart.dataStr }] },
        },
      })
    }
    if (url.startsWith(`https://easyeda.com/api/components/${rawPart.uuid}?`)) {
      // Public EasyEDA detail response for C42401279, recorded on 2026-10-28.
      return Response.json({ success: true, result: rawPart })
    }
    if (
      url.startsWith(
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C42401279.obj",
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

  // This snapshot records the bug: the wristband's six-pad touch sensor
  // request returns a three-hole MOSFET. A fix should update this reproduction.
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
      "importedManufacturerPartNumber": "HAOT10N65",
      "platedHoleCount": 3,
      "requestedManufacturerPartNumber": "TTP223-BA6",
      "smtPadCount": 0,
    }
  `)
})
