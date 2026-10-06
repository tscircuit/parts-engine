import { test, expect } from "bun:test"
import { jlcPartsEngine } from "../lib/jlc-parts-engine"
import { cache } from "../lib/jlc-parts-engine/jlc-parts-cache"

test("fetchPartCircuitJson returns circuit json for USB-C connector (C165948)", async () => {
  const result = await jlcPartsEngine.fetchPartCircuitJson!({
    supplierPartNumber: "C165948",
  })

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)

  const types = result!.map((el: any) => el.type)

  // Has PCB elements
  expect(types.filter((t: string) => t === "pcb_smtpad").length).toBe(12)
  expect(types.filter((t: string) => t === "pcb_plated_hole").length).toBe(4)
  expect(types).toContain("pcb_silkscreen_path")
  expect(types).toContain("pcb_courtyard_outline")
  expect(types).toContain("cad_component")
}, 20000)

test("fetchPartCircuitJson works with manufacturerPartNumber (TYPE-C-31-M-12)", async () => {
  const catalogKey = new URLSearchParams({
    search: "TYPE-C-31-M-12",
    json: "true",
  }).toString()
  // The live catalog can return unrelated parts. Fix the catalog response,
  // while still exercising the actual EasyEDA fetch and conversion below.
  cache.set(catalogKey, {
    components: [{ mfr: "TYPE-C-31-M-12", lcsc: 165948 }],
  })
  try {
    const result = await jlcPartsEngine.fetchPartCircuitJson!({
      manufacturerPartNumber: "TYPE-C-31-M-12",
    })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)

    const types = result!.map((el: any) => el.type)
    expect(types.filter((t: string) => t === "pcb_smtpad").length).toBe(12)
    expect(types.filter((t: string) => t === "pcb_plated_hole").length).toBe(4)
  } finally {
    cache.delete(catalogKey)
  }
}, 20000)
