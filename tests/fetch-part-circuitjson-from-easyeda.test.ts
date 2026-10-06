import { afterEach, test, expect, mock } from "bun:test"
import {
  cache,
  JlcPcbPartsEngine,
  type PlatformFetch,
} from "../lib/jlc-parts-engine"
import rawPart from "./fixtures/C165948.raweasy.json"

// Recorded EasyEDA component; keep footprint assertions independent of live catalogs.
const platformFetch = mock<PlatformFetch>(async (input, init) => {
  const url = String(input)
  if (url === "https://easyeda.com/api/components/search") {
    expect(new URLSearchParams(String(init?.body)).get("wd")).toBe("C165948")
    return Response.json({
      success: true,
      result: {
        lists: { lcsc: [{ uuid: rawPart.uuid, dataStr: rawPart.dataStr }] },
      },
    })
  }
  if (url.startsWith(`https://easyeda.com/api/components/${rawPart.uuid}?`)) {
    return Response.json({ success: true, result: rawPart })
  }
  if (
    url.startsWith(
      "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.obj",
    )
  ) {
    return new Response(null, { status: 404 })
  }
  throw new Error(`Unexpected fixture request: ${url}`)
})
const jlcPartsEngine = new JlcPcbPartsEngine({ platformFetch })

afterEach(() => cache.clear())

test("fetchPartCircuitJson returns circuit json for USB-C connector (C165948)", async () => {
  const result = await jlcPartsEngine.fetchPartCircuitJson!({
    supplierPartNumber: "C165948",
  })

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)

  const types = result!.map((el) => el.type)

  // Has PCB elements
  expect(types.filter((t) => t === "pcb_smtpad").length).toBe(12)
  expect(types.filter((t) => t === "pcb_plated_hole").length).toBe(4)
  expect(types).toContain("pcb_silkscreen_path")
  expect(types).toContain("pcb_courtyard_outline")
  expect(types).toContain("cad_component")
})

test("fetchPartCircuitJson works with manufacturerPartNumber (TYPE-C-31-M-12)", async () => {
  cache.set(
    new URLSearchParams({ search: "TYPE-C-31-M-12", json: "true" }).toString(),
    {
      components: [
        { mfr: "TYPE-C-OTHER", lcsc: 1 },
        { mfr: "TYPE-C-31-M-12", lcsc: 165948 },
      ],
    },
  )
  const result = await jlcPartsEngine.fetchPartCircuitJson!({
    manufacturerPartNumber: "TYPE-C-31-M-12",
  })

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)

  const types = result!.map((el) => el.type)
  expect(types.filter((t) => t === "pcb_smtpad").length).toBe(12)
  expect(types.filter((t) => t === "pcb_plated_hole").length).toBe(4)
})
