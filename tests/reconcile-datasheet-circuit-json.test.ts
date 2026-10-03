import { expect, test } from "bun:test"
import { any_circuit_element, type AnyCircuitElement } from "circuit-json"
import { reconcileDatasheetCircuitJson } from "../index"
import { convertDatasheetToCircuitJson } from "../lib/datasheets/convert-datasheet-to-circuit-json"

const footprint: AnyCircuitElement[] = [
  {
    type: "source_component",
    ftype: "simple_chip",
    name: "U1",
    source_component_id: "u1",
    manufacturer_part_number: "EXAMPLE",
  },
  {
    type: "source_port",
    source_port_id: "p1",
    source_component_id: "u1",
    pin_number: 1,
    name: "pin1",
    port_hints: ["B1"],
    requires_power: false,
  },
  {
    type: "source_port",
    source_port_id: "p2",
    source_component_id: "u1",
    pin_number: 2,
    name: "pin2",
    port_hints: ["A2"],
  },
  {
    type: "source_port",
    source_port_id: "p3",
    source_component_id: "u1",
    pin_number: 3,
    name: "pin3",
    port_hints: ["B2"],
  },
  {
    type: "source_port",
    source_port_id: "p4",
    source_component_id: "u1",
    pin_number: 4,
    name: "pin4",
    port_hints: ["A3", "B3"],
  },
]
const datasheet = convertDatasheetToCircuitJson({
  chipName: "EXAMPLE",
  pinInformation: [
    { pin_number: "B1", name: ["VDD"] },
    { pin_number: "A2", name: ["NC"] },
    { pin_number: "A3", name: [] },
    { pin_number: "B3", name: [] },
    { pin_number: "D1", name: [] },
  ],
  pinAttributes: {
    B1: { requiresPower: true, requiresVoltage: "1.8V" },
    A3: { requiresGround: true },
    B3: { isOutput: true },
    D1: { isGpio: true },
  },
})

test("BGA hints map attributes without geometry mutation and report absent, empty and ambiguous pins", () => {
  const input = structuredClone(footprint)
  const originalDatasheet = structuredClone(datasheet)
  const result = reconcileDatasheetCircuitJson({
    circuitJson: input,
    datasheetCircuitJson: datasheet,
  })
  expect(result.circuitJson[1]).toMatchObject({
    source_port_id: "p1",
    pin_number: 1,
    requires_power: true,
    requires_voltage: "1.8V",
  })
  expect(result.circuitJson[2]).toEqual(input[2]!)
  expect(result.circuitJson[4]).toEqual(input[4]!)
  expect(result.matchedSourcePortIds).toEqual(["p1", "p2"])
  expect(result.unmatchedSourcePortIds).toEqual(["p3"])
  expect(result.missingAttributeSourcePortIds).toEqual(["p2", "p3", "p4"])
  expect(result.ambiguousMatches).toEqual([
    {
      sourcePortId: "p4",
      datasheetSourcePortIds: [
        "datasheet:EXAMPLE:pinA3",
        "datasheet:EXAMPLE:pinB3",
      ],
    },
  ])
  expect(result.unmatchedDatasheetSourcePortIds).toContain(
    "datasheet:EXAMPLE:pinD1",
  )
  expect(input).toEqual(footprint)
  expect(datasheet).toEqual(originalDatasheet)
  expect(result.circuitJson).toHaveLength(input.length)
  for (const port of datasheet)
    expect(any_circuit_element.parse(port)).toEqual(port)
})

test("existing attribute priority preserves explicit false and voltage overrides", () => {
  const result = reconcileDatasheetCircuitJson({
    circuitJson: footprint,
    datasheetCircuitJson: datasheet,
    attributePriority: "existing",
  })
  expect(result.circuitJson[1]).toMatchObject({
    requires_power: false,
    requires_voltage: "1.8V",
  })
})

test("component selection prevents attribute leakage and manufacturer mismatches reject", () => {
  const other: AnyCircuitElement[] = [
    {
      type: "source_component",
      ftype: "simple_chip",
      name: "U2",
      source_component_id: "u2",
      manufacturer_part_number: "OTHER",
    },
    {
      type: "source_port",
      source_port_id: "other",
      source_component_id: "u2",
      name: "pin1",
      pin_number: 1,
    },
  ]
  const circuitJson = [...footprint, ...other]
  expect(() =>
    reconcileDatasheetCircuitJson({
      circuitJson,
      datasheetCircuitJson: datasheet,
    }),
  ).toThrow("explicit target")
  const result = reconcileDatasheetCircuitJson({
    circuitJson,
    datasheetCircuitJson: datasheet,
    sourceComponentId: "u1",
  })
  expect(result.circuitJson.slice(-2)).toEqual(other)
  expect(() =>
    reconcileDatasheetCircuitJson({
      circuitJson,
      datasheetCircuitJson: datasheet,
      sourceComponentId: "u2",
    }),
  ).toThrow("imported part is OTHER")
})

test("conflicting signal aliases are reported instead of choosing an electrical role", () => {
  const labels = convertDatasheetToCircuitJson({
    chipName: "EXAMPLE",
    pinAttributes: {
      VDD: { requiresVoltage: "3.3V" },
      AVDD: { requiresVoltage: "1.8V" },
    },
  })
  const circuitJson: AnyCircuitElement[] = [
    footprint[0]!,
    {
      type: "source_port",
      source_port_id: "vdd",
      source_component_id: "u1",
      name: "VDD",
      port_hints: ["AVDD"],
    },
  ]
  const result = reconcileDatasheetCircuitJson({
    circuitJson,
    datasheetCircuitJson: labels,
  })
  expect(result.ambiguousMatches[0]?.sourcePortId).toBe("vdd")
  expect(result.circuitJson).toEqual(circuitJson)
})
