import { expect, test } from "bun:test"
import "bun-match-svg"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { JlcPcbPartsEngine, type PlatformFetch } from "../lib/jlc-parts-engine"
import rawEasyEdaJson from "./fixtures/C41413180.raweasy.json"

test("JLC imports preserve the RGB LED's filled fabrication symbols", async () => {
  const fixtureFetch: PlatformFetch = async (request) => {
    const url =
      typeof request === "string"
        ? request
        : request instanceof URL
          ? request.href
          : request.url
    if (url === "https://easyeda.com/api/components/search") {
      return Response.json({
        success: true,
        result: {
          lists: {
            lcsc: [
              { uuid: rawEasyEdaJson.uuid, dataStr: rawEasyEdaJson.dataStr },
            ],
          },
        },
      })
    }
    if (
      url.startsWith(
        `https://easyeda.com/api/components/${rawEasyEdaJson.uuid}`,
      )
    ) {
      return Response.json({ success: true, result: rawEasyEdaJson })
    }
    if (
      url.startsWith(
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C41413180.obj",
      )
    ) {
      return new Response(
        "Model metadata is not needed for fabrication notes",
        { status: 404 },
      )
    }
    throw new Error(`Unexpected fixture request: ${url}`)
  }
  const engine = new JlcPcbPartsEngine({ platformFetch: fixtureFetch })
  const circuitJson = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C41413180",
  })
  if (!circuitJson) throw new Error("Expected imported RGB LED Circuit JSON")
  const notes = circuitJson.filter(
    (element) => element.type === "pcb_fabrication_note_path",
  )
  expect(notes).toHaveLength(4)
  for (const note of notes) {
    expect(note).toMatchObject({
      is_filled: true,
      has_stroke: false,
      stroke_width: 0,
    })
    expect(note.route.at(-1)).toEqual(note.route[0]!)
  }
  const plus = notes.find((note) => note.route.length === 13)
  if (!plus) throw new Error("Expected the supplier's plus-sign geometry")
  expect(Math.abs(plus.route[0]!.y - plus.route[1]!.y)).toBeCloseTo(0.127, 5)
  await expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
  )
})
