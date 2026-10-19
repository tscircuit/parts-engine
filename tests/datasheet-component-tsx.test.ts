import { expect, test } from "bun:test"
import { getDatasheetComponentTsx } from "../lib/datasheets/component-tsx"

test("generates a component from datasheet metadata with physical pin attributes", () => {
  const source = getDatasheetComponentTsx({
    chip_name: "AM62L32",
    footprinter_string: "bga373",
    pin_information: [
      { pin_number: "A1", name: ["VSS"] },
      { pin_number: "2", name: "VDD" },
    ],
    pin_attributes: {
      pinA1: { requiresGround: true },
      pin2: { requiresPower: true },
    },
  })

  expect(source).toContain('footprint={"bga373"}')
  expect(source).toContain('"A1":{"requiresGround":true}')
  expect(source).toContain('"pin2":{"requiresPower":true}')
  expect(source).not.toContain('"pinA1"')
})
