import { JlcPcbPartsEngine, createDatasheetInformationLoader } from "../index"
import { expect, test } from "bun:test"
import { commonComponentProps } from "@tscircuit/props"
import { any_circuit_element } from "circuit-json"
import { reconcileDatasheetCircuitJson } from "../index"
import boardLed from "./fixtures/f1c100s/board-led.source.json"
import type { PlatformFetch } from "../lib/jlc-parts-engine/types"
import rawF1c from "./fixtures/f1c100s/C1511928.raweasy.json"
import rawAnalog from "./fixtures/f1c100s/C460327.raweasy.json"
import rawDdr from "./fixtures/f1c100s/C176945.raweasy.json"
import f1c from "./fixtures/f1c100s/F1C100S.datasheet.json"
import analog from "./fixtures/f1c100s/AP2127K-2.8TRG1.datasheet.json"
import ddr from "./fixtures/f1c100s/AP2112K-2.5TRG1.datasheet.json"
import oldRegulator from "./fixtures/f1c100s/AP2112K-1.8TRG1.datasheet.json"
import core from "./fixtures/f1c100s/AP2112K-1.2TRG1.datasheet.json"
import io from "./fixtures/f1c100s/AP2112M-3.3TRG1.datasheet.json"

import flash from "./fixtures/f1c100s/W25Q128JVSIQ.datasheet.json"
import buffer from "./fixtures/f1c100s/74AHCT2G125DC,125.datasheet.json"
import esd from "./fixtures/f1c100s/USBLC6-2SC6.datasheet.json"
import led from "./fixtures/f1c100s/SK9822-A.datasheet.json"
import rawCore from "./fixtures/f1c100s/C460310.raweasy.json"
import rawIo from "./fixtures/f1c100s/C5290219.raweasy.json"
import rawFlash from "./fixtures/f1c100s/C97521.raweasy.json"
import rawBuffer from "./fixtures/f1c100s/C554633.raweasy.json"
import rawEsd from "./fixtures/f1c100s/C7519.raweasy.json"
import rawLed from "./fixtures/f1c100s/C5378730.raweasy.json"

const records = [
  f1c,
  analog,
  ddr,
  oldRegulator,
  core,
  io,
  flash,
  buffer,
  esd,
  led,
]
const normalize = (s: string) => s.replace(/[^0-9a-zA-Z_-]/g, "").toLowerCase()
const rawParts = [
  rawF1c,
  rawAnalog,
  rawDdr,
  rawCore,
  rawIo,
  rawFlash,
  rawBuffer,
  rawEsd,
  rawLed,
]
const fixtureFetch: PlatformFetch = async (input, init) => {
  const url = String(input)
  if (url.startsWith("https://api.tscircuit.com/datasheets/get?")) {
    const chip = new URL(url).searchParams.get("chip_name")
    const record = records.find(
      (r) => normalize(r.datasheet.chip_name) === chip,
    )
    if (!record) throw Error(`Unexpected datasheet ${chip}`)
    return Response.json(record)
  }
  if (url === "https://easyeda.com/api/components/search") {
    const id = new URLSearchParams(String(init?.body)).get("wd")
    const raw = rawParts.find((p) => p.lcsc.number === id)!
    return Response.json({ success: true, result: { lists: { lcsc: [raw] } } })
  }
  const raw = rawParts.find((p) =>
    url.startsWith(`https://easyeda.com/api/components/${p.uuid}`),
  )
  if (raw) return Response.json({ success: true, result: raw })
  if (url.startsWith("https://modelcdn.tscircuit.com/"))
    return new Response(null, { status: 404 })
  throw Error(`Unexpected request ${url}`)
}

test("uploaded F1C and regulator records cover every physical pin using props attributes", () => {
  for (const { datasheet } of records) {
    const attributes = commonComponentProps.shape.pinAttributes.parse(
      datasheet.pin_attributes,
    )!
    expect<unknown>(attributes).toEqual(datasheet.pin_attributes)
    expect(Object.keys(attributes)).toHaveLength(
      datasheet.pin_information.length,
    )
    for (const pin of datasheet.pin_information) {
      expect(
        Object.keys(
          attributes[`pin${pin.pin_number}`] ??
            attributes[pin.name.find((name) => attributes[name])!]!,
        ).length,
      ).toBeGreaterThan(0)
    }
  }
  expect(f1c.datasheet.pin_information).toHaveLength(89)
})

test("real F1C import retains all 89 pins' attributes, including direction-only analog pins", async () => {
  const engine = new JlcPcbPartsEngine({ platformFetch: fixtureFetch })
  const result = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C1511928",
    includeDatasheetInformation: true,
  })
  const ports = result!.filter((e) => e.type === "source_port")
  expect(ports).toHaveLength(89)
  const byPin = (n: number) => ports.find((p) => p.pin_number === n)!
  const pinAttributes = f1c.datasheet.pin_attributes
  for (const port of ports) {
    const attributes =
      pinAttributes[`pin${port.pin_number}` as keyof typeof pinAttributes]
    for (const [key, value] of Object.entries(attributes)) {
      if (key === "capabilities") {
        for (const capability of value as string[])
          expect(port).toHaveProperty(`supports_${capability}`, true)
      } else {
        expect(port).toHaveProperty(
          key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
          value,
        )
      }
    }
  }
  expect(byPin(1)).toMatchObject({ is_output: true })
  expect(byPin(2)).toMatchObject({ is_input: true })
  expect(byPin(6)).toMatchObject({
    is_gpio: true,
    is_bidirectional: true,
    can_use_tri_state: true,
  })
  expect(byPin(48)).toMatchObject({ supports_i2c_sda: true })
  expect(byPin(49)).toMatchObject({ supports_i2c_scl: true })
  expect(byPin(63)).toMatchObject({
    supports_uart_tx: true,
    supports_spi_miso: true,
  })
  expect(byPin(64)).toMatchObject({
    supports_uart_rx: true,
    supports_spi_sck: true,
  })
  expect(byPin(89)).toMatchObject({ requires_ground: true })
})

test("real 2.8V and 2.5V regulator imports match F1C supply requirements; old 1.8V does not", async () => {
  const engine = new JlcPcbPartsEngine({
    platformFetch: fixtureFetch,
    includeDatasheetInformation: true,
  })
  const f1cJson = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C1511928",
  })
  const analogJson = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C460327",
  })
  const ddrJson = await engine.fetchPartCircuitJson({
    supplierPartNumber: "C176945",
  })
  const output = (cj: NonNullable<typeof analogJson>) =>
    cj.find((e) => e.type === "source_port" && e.pin_number === 5)
  const avcc = f1cJson!.find(
    (e) => e.type === "source_port" && e.pin_number === 80,
  )!
  expect(avcc).toMatchObject({ requires_power: true, requires_voltage: 2.8 })
  expect(output(analogJson!)).toMatchObject({
    provides_power: true,
    provides_voltage: 2.8,
  })
  for (const n of [30, 31, 32, 34, 36]) {
    expect(
      f1cJson!.find((e) => e.type === "source_port" && e.pin_number === n),
    ).toMatchObject({ requires_power: true, requires_voltage: 2.5 })
  }
  expect(output(ddrJson!)).toMatchObject({
    provides_power: true,
    provides_voltage: 2.5,
  })
  const old = await createDatasheetInformationLoader({
    platformFetch: fixtureFetch,
  })({
    manufacturerPartNumber: "AP2112K-1.8TRG1",
  })
  expect(
    old!.circuitJson
      .filter((e) => e.type === "source_port")
      .find((e) => e.pin_number === 5)!.provides_voltage,
  ).toBe(1.8)
  expect(
    old!.circuitJson
      .filter((e) => e.type === "source_port")
      .find((e) => e.pin_number === 5)!.provides_voltage,
  ).not.toBe(2.8)
  expect(
    old!.circuitJson
      .filter((e) => e.type === "source_port")
      .find((e) => e.pin_number === 5)!.provides_voltage,
  ).not.toBe(2.5)
})

test("every pin of all nine board ICs receives electrical attributes", async () => {
  const engine = new JlcPcbPartsEngine({
    platformFetch: fixtureFetch,
    includeDatasheetInformation: true,
  })
  let count = 0
  for (const raw of rawParts) {
    const result = await engine.fetchPartCircuitJson({
      supplierPartNumber: raw.lcsc.number,
    })
    const ports = result!.filter((e) => e.type === "source_port")
    const record = records.find(
      (r) =>
        normalize(r.datasheet.chip_name) ===
        normalize(raw.dataStr.head.c_para["Manufacturer Part"]),
    )!
    expect(ports).toHaveLength(record.datasheet.pin_information.length)
    for (const port of ports) {
      const electrical = Object.keys(port).filter(
        (key) =>
          ![
            "type",
            "source_port_id",
            "source_component_id",
            "name",
            "pin_number",
            "port_hints",
          ].includes(key),
      )
      expect(electrical.length).toBeGreaterThan(0)
      count++
    }
  }
  expect(count).toBe(140)
})

test("SK9822-A uses imported signal labels without merging unrelated manufacturer pin roles", async () => {
  const metadata = await createDatasheetInformationLoader({
    platformFetch: fixtureFetch,
  })({
    manufacturerPartNumber: "SK9822-A",
  })
  const result = reconcileDatasheetCircuitJson({
    circuitJson: boardLed.map((e) => any_circuit_element.parse(e)),
    datasheetCircuitJson: metadata!.circuitJson,
  }).circuitJson
  const ports = result.filter((e) => e.type === "source_port")
  const pin = (n: number) => ports.find((p) => p.pin_number === n)!
  expect(pin(1)).toMatchObject({ requires_ground: true })
  expect(pin(1)).not.toHaveProperty("is_input")
  expect(pin(2)).toMatchObject({ requires_power: true, requires_voltage: 5 })
  expect(pin(2)).not.toHaveProperty("is_input")
  expect(pin(3)).toMatchObject({ is_output: true })
  expect(pin(3)).not.toHaveProperty("requires_ground")
  expect(pin(4)).toMatchObject({ is_output: true })
  expect(pin(4)).not.toHaveProperty("requires_power")
  expect(pin(5)).toMatchObject({ is_input: true })
  expect(pin(5)).not.toHaveProperty("is_output")
  expect(pin(6)).toMatchObject({ is_input: true })
  expect(pin(6)).not.toHaveProperty("is_output")
})
