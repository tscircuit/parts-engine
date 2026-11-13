import { expect, test } from "bun:test"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine"
import rawPart from "./fixtures/C1850278.raweasy.json"

test("TPS26632RGER lookup includes JLCPCB's assembly zero alongside the CAD footprint", async () => {
  const partsEngine = new JlcPcbPartsEngine({
    platformFetch: async (input) => {
      const url = String(input)
      if (url === "https://easyeda.com/api/components/search") {
        return Response.json({
          success: true,
          result: {
            lists: { lcsc: [{ uuid: rawPart.uuid, dataStr: rawPart.dataStr }] },
          },
        })
      }
      if (
        url.startsWith(`https://easyeda.com/api/components/${rawPart.uuid}?`)
      ) {
        return Response.json({ success: true, result: rawPart })
      }
      if (url.startsWith("https://modelcdn.tscircuit.com/")) {
        return new Response(null, { status: 404 })
      }
      throw new Error(`Unexpected request ${url}`)
    },
  })
  const part = await partsEngine.fetchPartCircuitJson({
    supplierPartNumber: "C1850278",
  })
  const footprint = part?.find((element) => element.type === "pcb_component")
  expect(footprint?.supplier_pin1_location_map?.jlcpcb).toBe("bottomside_left")
  const pin1 = part?.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.shape === "rect" &&
      element.port_hints?.includes("pin1"),
  )
  if (pin1?.type !== "pcb_smtpad" || pin1.shape !== "rect") {
    throw new Error("Expected the EasyEDA pin 1 pad")
  }
  expect(pin1.x).toBeLessThan(-2)
  expect(pin1.y).toBeGreaterThan(1)
})
