import { afterEach, expect, mock, test } from "bun:test"
import { source_port, type AnyCircuitElement } from "circuit-json"
import {
  JlcPcbPartsEngine,
  cache,
  type PlatformFetch,
} from "../lib/jlc-parts-engine"
import { enrichCircuitJsonWithDatasheet } from "../lib/datasheets/enrich-circuit-json-with-datasheet"
import type { DatasheetInformation } from "../lib/datasheets/types"
import rawPart from "./fixtures/C11337.raweasy.json"

const datasheet = {
  datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
  chip_name: "TLV70033DDCR",
  pin_attributes: {
    pin1: { requiresPower: true, requiresVoltage: "5V", mustBeConnected: true },
    pin2: { requiresGround: true, providesVoltage: 0 },
    pin3: {
      mustBeConnected: false,
      capabilities: ["i2c_sda"],
      activeCapability: "i2c_sda",
      canUseOpenDrain: true,
    },
    pin4: { doNotConnect: true },
    pin5: { providesPower: true, providesVoltage: "3.3V" },
  },
}

const fixtureFetch = (datasheetResponse = () => Response.json({ datasheet })) =>
  mock<PlatformFetch>(async (input) => {
    const url = String(input)
    if (url.startsWith("https://api.tscircuit.com/datasheets/get?")) {
      expect(new URL(url).searchParams.get("chip_name")).toBe("tlv70033ddcr")
      return datasheetResponse()
    }
    if (url === "https://easyeda.com/api/components/search") {
      return Response.json({
        success: true,
        result: {
          lists: { lcsc: [{ uuid: rawPart.uuid, dataStr: rawPart.dataStr }] },
        },
      })
    }
    if (url.startsWith(`https://easyeda.com/api/components/${rawPart.uuid}`)) {
      return Response.json({ success: true, result: rawPart })
    }
    if (
      url.startsWith(
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C11337.obj",
      )
    ) {
      return new Response(null, { status: 404 })
    }
    throw new Error(`Unexpected fixture request: ${url}`)
  })

afterEach(() => cache.clear())

test("fetchPartCircuitJson includes electrical attributes on canonical source ports", async () => {
  const platformFetch = fixtureFetch()
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  const result = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C11337",
  })
  const ports = result!.filter((element) => element.type === "source_port")
  const byNumber = (pinNumber: number) =>
    ports.find((port) => port.pin_number === pinNumber)!
  expect(byNumber(1)).toMatchObject({
    requires_power: true,
    requires_voltage: "5V",
    must_be_connected: true,
  })
  expect(byNumber(2)).toMatchObject({
    requires_ground: true,
    provides_voltage: 0,
  })
  expect(byNumber(3)).toMatchObject({
    must_be_connected: false,
    supports_i2c_sda: true,
    is_configured_for_i2c_sda: true,
    can_use_open_drain: true,
  })
  expect(byNumber(4).do_not_connect).toBe(true)
  expect(byNumber(5)).toMatchObject({
    provides_power: true,
    provides_voltage: "3.3V",
  })
  for (const port of ports) expect(source_port.parse(port)).toEqual(port)
  expect(
    result!.find((element) => element.type === "source_component"),
  ).toMatchObject({ manufacturer_part_number: "TLV70033DDCR" })
  const plain = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C11337",
    includeDatasheetInformation: false,
  })
  expect(
    result!.filter(
      (element) =>
        element.type !== "source_component" && element.type !== "source_port",
    ),
  ).toEqual(
    plain!.filter(
      (element) =>
        element.type !== "source_component" && element.type !== "source_port",
    ),
  )
  expect(
    platformFetch.mock.calls.filter(([input]) =>
      String(input).includes("/datasheets/get"),
    ),
  ).toHaveLength(1)
})

test("per-call opt-in uses the override fetch and reuses cached datasheet results", async () => {
  const defaultFetch = mock<PlatformFetch>(async () => {
    throw new Error("Wrong fetch")
  })
  const platformFetch = fixtureFetch()
  const engine = new JlcPcbPartsEngine({ platformFetch: defaultFetch })
  for (let i = 0; i < 2; i++) {
    const result = await engine.fetchPartCircuitJson({
      supplierPartNumber: "C11337",
      includeDatasheetInformation: true,
      platformFetch,
    })
    expect(
      result!.find(
        (element) => element.type === "source_port" && element.pin_number === 5,
      ),
    ).toMatchObject({ provides_voltage: "3.3V" })
  }
  expect(defaultFetch).not.toHaveBeenCalled()
  expect(
    platformFetch.mock.calls.filter(([input]) =>
      String(input).includes("/datasheets/get"),
    ),
  ).toHaveLength(1)
})

test("disabled and missing datasheet paths preserve the original Circuit JSON", async () => {
  const platformFetch = fixtureFetch(() => new Response(null, { status: 404 }))
  const engine = new JlcPcbPartsEngine({ platformFetch })
  const plain = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C11337",
  })
  expect(
    platformFetch.mock.calls.some(([input]) =>
      String(input).includes("/datasheets/get"),
    ),
  ).toBe(false)
  const missing = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C11337",
    includeDatasheetInformation: true,
  })
  expect(missing).toEqual(plain!)
})

test("datasheet transport failures remain distinguishable from missing attributes", async () => {
  const engine = new JlcPcbPartsEngine({
    platformFetch: fixtureFetch(() => new Response(null, { status: 503 })),
    includeDatasheetInformation: true,
  })
  await expect(
    engine.fetchPartCircuitJson({ supplierPartNumber: "C11337" }),
  ).rejects.toThrow("503")
})

test("a mismatched imported voltage variant is never enriched with the requested variant", async () => {
  const platformFetch = fixtureFetch()
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  await expect(
    engine.fetchPartCircuitJson({
      supplierPartNumber: "C11337",
      manufacturerPartNumber: "TLV70028DDCR",
    }),
  ).rejects.toThrow("imported part is TLV70033DDCR")
  expect(
    platformFetch.mock.calls.some(([input]) =>
      String(input).includes("/datasheets/get"),
    ),
  ).toBe(false)
})

test("enriched manufacturer lookup requires an exact match instead of a fuzzy voltage variant", async () => {
  cache.set(
    new URLSearchParams({ search: "TLV70028DDCR", json: "true" }).toString(),
    { components: [{ mfr: "TLV70018DDCR", lcsc: 11337 }] },
  )
  const platformFetch = fixtureFetch()
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  expect(
    await engine.fetchPartCircuitJson({
      manufacturerPartNumber: "TLV70028DDCR",
    }),
  ).toBeUndefined()
  expect(platformFetch).not.toHaveBeenCalled()
})

test("enrichment uses physical pins, preserves omitted values, and does not mutate geometry", () => {
  const input: AnyCircuitElement[] = [
    {
      type: "source_component",
      ftype: "simple_chip",
      source_component_id: "u1",
      name: "U1",
    },
    {
      type: "source_port",
      source_port_id: "p1",
      source_component_id: "u1",
      name: "pinA1",
      requires_power: true,
    },
    {
      type: "source_port",
      source_port_id: "p2",
      source_component_id: "u1",
      name: "VDD",
      pin_number: 2,
      port_hints: ["pinA1"],
    },
    {
      type: "source_port",
      source_port_id: "p3",
      source_component_id: "u1",
      name: "VDD",
      pin_number: 3,
    },
    {
      type: "source_port",
      source_port_id: "p4",
      source_component_id: "other",
      name: "pinA1",
    },
  ]
  const saved = structuredClone(input)
  const information: DatasheetInformation = {
    datasheetId: datasheet.datasheet_id,
    chipName: "REG-2V8",
    pinAttributes: {
      pinA1: { requiresVoltage: 2.8 },
      pin2: { providesVoltage: 1.8 },
      pin99: { providesVoltage: 9 },
    },
  }
  const result = enrichCircuitJsonWithDatasheet(input, information)
  expect(result[1]).toMatchObject({
    requires_power: true,
    requires_voltage: 2.8,
  })
  expect(result[2]).toMatchObject({ provides_voltage: 1.8 })
  expect(result[3]).toEqual(saved[3]!)
  expect(result[4]).toEqual(saved[4]!)
  expect(result).toHaveLength(input.length)
  expect(input).toEqual(saved)
})

test("exact manufacturer searches return enriched Circuit JSON", async () => {
  cache.set(
    new URLSearchParams({ search: "TLV70033DDCR", json: "true" }).toString(),
    {
      components: [{ mfr: "TLV70033DDCR", lcsc: 11337 }],
    },
  )
  const engine = new JlcPcbPartsEngine({ platformFetch: fixtureFetch() })
  const result = await engine.fetchPartCircuitJson({
    manufacturerPartNumber: "TLV70033DDCR",
    includeDatasheetInformation: true,
  })
  expect(
    result!.find(
      (element) => element.type === "source_port" && element.pin_number === 5,
    ),
  ).toMatchObject({ provides_voltage: "3.3V" })
})
