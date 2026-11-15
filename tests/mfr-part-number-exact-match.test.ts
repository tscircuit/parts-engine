import { test, expect } from "bun:test"
import { jlcPartsEngine } from "../lib/jlc-parts-engine"

test("fetchPartCircuitJson prefers exact manufacturerPartNumber match over first fuzzy hit", async () => {
  const result = await jlcPartsEngine.fetchPartCircuitJson!({
    manufacturerPartNumber: "TYPE-C-31-M-12",
  })

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)

  const types = result!.map((el: any) => el.type)

  // TYPE-C-31-M-12 should resolve to USB-C connector (C165948) with 12 SMT pads and 4 plated holes
  expect(types.filter((t: string) => t === "pcb_smtpad").length).toBe(12)
  expect(types.filter((t: string) => t === "pcb_plated_hole").length).toBe(4)
}, 20000)
