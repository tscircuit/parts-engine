import { expect, test } from "bun:test"
import type { AnyCircuitElement, SourceSimpleChip } from "circuit-json"
import {
  createDatasheetInformationLoader,
  reconcileDatasheetCircuitJson,
} from "../index"

const groups = [
  ["A", "B"],
  ["C", "D"],
]

test("datasheet switch contacts survive lookup and reconciliation using supplier-local IDs", async () => {
  const load = createDatasheetInformationLoader({
    platformFetch: async () =>
      Response.json({
        datasheet: {
          datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
          chip_name: "TS-1187A-B-A-B",
          pin_information: ["A", "B", "C", "D"].map((pin_number) => ({
            pin_number,
            name: [pin_number],
            description: "Contact",
            capabilities: [],
          })),
          pin_attributes: null,
          internally_connected_pins: groups,
        },
      }),
  })
  const { circuitJson: datasheetCircuitJson } = (await load({
    manufacturerPartNumber: "TS-1187A-B-A-B",
  }))!
  const chip = datasheetCircuitJson.find(
    (element) => element.type === "source_component",
  )!
  const ports = datasheetCircuitJson.filter(
    (element) => element.type === "source_port",
  )
  expect(chip.internally_connected_source_port_ids).toEqual([
    [ports[0]!.source_port_id, ports[1]!.source_port_id],
    [ports[2]!.source_port_id, ports[3]!.source_port_id],
  ])
  const supplier: AnyCircuitElement[] = [
    {
      type: "source_component",
      ftype: "simple_chip",
      source_component_id: "supplier",
      name: "SW1",
      manufacturer_part_number: "TS-1187A-B-A-B",
    },
    ...["A", "B", "C", "D"].map((name, i) => ({
      type: "source_port" as const,
      source_component_id: "supplier",
      source_port_id: `supplier${i}`,
      name,
      pin_number: i + 1,
      port_hints: [name],
    })),
  ]
  const original = structuredClone(supplier)
  const result = reconcileDatasheetCircuitJson({
    circuitJson: supplier,
    datasheetCircuitJson,
  })
  expect(
    (result.circuitJson[0] as SourceSimpleChip)
      .internally_connected_source_port_ids,
  ).toEqual([
    ["supplier0", "supplier1"],
    ["supplier2", "supplier3"],
  ])
  expect(supplier).toEqual(original)
  const missing = reconcileDatasheetCircuitJson({
    circuitJson: supplier.slice(0, -1),
    datasheetCircuitJson,
  })
  expect(
    (missing.circuitJson[0] as SourceSimpleChip)
      .internally_connected_source_port_ids,
  ).toEqual([["supplier0", "supplier1"]])
  const explicit = structuredClone(supplier)
  ;(explicit[0] as SourceSimpleChip).internally_connected_source_port_ids = []
  expect(
    (
      reconcileDatasheetCircuitJson({
        circuitJson: explicit,
        datasheetCircuitJson,
        attributePriority: "existing",
      }).circuitJson[0] as SourceSimpleChip
    ).internally_connected_source_port_ids,
  ).toEqual([])
})

test("legacy, empty and invalid groups stay distinct and unresolved groups never partially connect pins", async () => {
  for (const groups of [undefined, null, [], [["A", "UNKNOWN"]]]) {
    const load = createDatasheetInformationLoader({
      platformFetch: async () =>
        Response.json({
          datasheet: {
            datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
            chip_name: "SWITCH",
            pin_attributes: null,
            pin_information: [
              {
                pin_number: "A",
                name: ["A"],
                description: "Contact",
                capabilities: [],
              },
            ],
            internally_connected_pins: groups,
          },
        }),
    })
    const data = (await load({ manufacturerPartNumber: "SWITCH" }))!
    const chip = data.circuitJson.find(
      (element) => element.type === "source_component",
    )!
    expect(chip.internally_connected_source_port_ids).toEqual(
      groups == null ? undefined : [],
    )
  }
  const load = createDatasheetInformationLoader({
    platformFetch: async () =>
      Response.json({
        datasheet: {
          datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
          chip_name: "SWITCH",
          pin_attributes: null,
          internally_connected_pins: [[true]],
        },
      }),
  })
  await expect(load({ manufacturerPartNumber: "SWITCH" })).rejects.toThrow()
})
