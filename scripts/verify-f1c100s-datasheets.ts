import { source_pin_attributes } from "circuit-json"
import { storedDatasheetResponseSchema } from "../lib/datasheets/stored-datasheet-response-schema"
/** Read-only live check: bun scripts/verify-f1c100s-datasheets.ts */
import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { JlcPcbPartsEngine, fetchDatasheetInformation } from "../index"
import { convertDatasheetToCircuitJson } from "../lib/datasheets/convert-datasheet-to-circuit-json"

const fixtures = join(import.meta.dir, "../tests/fixtures/f1c100s")
const engine = new JlcPcbPartsEngine({
  includeDatasheetInformation: true,
})
const results = []
for (const filename of (await readdir(fixtures)).filter((f) =>
  f.endsWith(".raweasy.json"),
)) {
  const raw = JSON.parse(await readFile(join(fixtures, filename), "utf8"))
  const manufacturerPartNumber = raw.dataStr.head.c_para["Manufacturer Part"]
  const supplierPartNumber = raw.lcsc.number
  // Compare against the current API record, since reviewed electrical notes
  // and attributes can evolve after these supplier fixtures were captured.
  const response = await fetch(
    `https://api.tscircuit.com/datasheets/get?chip_name=${encodeURIComponent(manufacturerPartNumber)}`,
    { signal: AbortSignal.timeout(5_000) },
  )
  assert.equal(response.status, 200)
  const { datasheet: stored } = storedDatasheetResponseSchema.parse(
    await response.json(),
  )
  assert.ok(stored.pin_information)
  const information = await fetchDatasheetInformation({
    manufacturerPartNumber,
  })
  assert.ok(information, `${manufacturerPartNumber}: API record is missing`)
  assert.deepEqual(
    information.circuitJson,
    convertDatasheetToCircuitJson({
      chipName: manufacturerPartNumber,
      pinInformation: stored.pin_information,
      pinAttributes: stored.pin_attributes,
    }),
  )
  assert.ok(
    information.generatedTsx,
    `${manufacturerPartNumber}: generated TSX is missing`,
  )
  const cj = await engine.fetchPartCircuitJson({
    supplierPartNumber,
    manufacturerPartNumber,
  })
  assert.ok(cj, `${manufacturerPartNumber}: Circuit JSON is missing`)
  const ports = cj.filter((e) => e.type === "source_port")
  assert.equal(ports.length, stored.pin_information.length)
  const missingAttributePins: number[] = []
  for (const port of ports) {
    const electrical = source_pin_attributes.parse(port)
    const attributes = Object.keys(electrical).filter(
      (key) => Reflect.get(electrical, key) !== undefined,
    )
    if (!attributes.length) {
      // An explicitly empty API map is uncertainty, not a transport failure.
      assert.equal(
        Object.values(
          stored.pin_attributes?.[`pin${port.pin_number}`] ?? {},
        ).filter((attribute) =>
          Array.isArray(attribute)
            ? attribute.length > 0
            : attribute !== undefined,
        ).length,
        0,
        `${manufacturerPartNumber}: populated attributes were lost on pin${port.pin_number}`,
      )
      missingAttributePins.push(port.pin_number!)
    }
    for (const [key, expected] of Object.entries(
      stored.pin_attributes?.[`pin${port.pin_number}`] ?? {},
    )) {
      if (
        key === "capabilities" ||
        key === "activeCapabilities" ||
        key === "activeCapability"
      ) {
        const capabilities = Array.isArray(expected) ? expected : [expected]
        for (const capability of capabilities)
          assert.equal(
            Reflect.get(
              port,
              `${key === "capabilities" ? "supports" : "is_configured_for"}_${capability}`,
            ),
            true,
          )
      } else
        assert.deepEqual(
          Reflect.get(
            port,
            key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
          ),
          expected,
        )
    }
  }
  if (manufacturerPartNumber === "F1C100S") {
    assert.equal(ports.find((p) => p.pin_number === 80)?.requires_voltage, 2.8)
    for (const n of [30, 31, 32, 34, 36])
      assert.equal(ports.find((p) => p.pin_number === n)?.requires_voltage, 2.5)
  }
  if (manufacturerPartNumber === "AP2127K-2.8TRG1")
    assert.equal(ports.find((p) => p.pin_number === 5)?.provides_voltage, 2.8)
  if (manufacturerPartNumber === "AP2112K-2.5TRG1")
    assert.equal(ports.find((p) => p.pin_number === 5)?.provides_voltage, 2.5)
  results.push({
    manufacturerPartNumber,
    supplierPartNumber,
    ports: ports.length,
    missingAttributePins,
    datasheetId: information.datasheetId,
  })
  console.error(`Verified ${manufacturerPartNumber}: ${ports.length} pins`)
}
const old = await fetchDatasheetInformation({
  manufacturerPartNumber: "AP2112K-1.8TRG1",
})
assert.equal(
  old?.circuitJson
    .filter((e) => e.type === "source_port")
    .find((e) => e.pin_number === 5)?.provides_voltage,
  1.8,
)
const url = "https://api.tscircuit.com/datasheets/get?chip_name=F1C100S"
const response = await fetch(url)
assert.equal(response.status, 200)
const etag = response.headers.get("etag")
assert.ok(etag)
assert.match(response.headers.get("cache-control") ?? "", /max-age=60/)
const conditional = await fetch(url, { headers: { "If-None-Match": etag } })
assert.equal(conditional.status, 304)
assert.equal(await conditional.text(), "")
console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      apiBaseUrl: "https://api.tscircuit.com",
      results,
      boardIcPins: results.reduce((n, r) => n + r.ports, 0),
      oldRegulatorVoltage: 1.8,
      cacheControl: response.headers.get("cache-control"),
      conditionalGetStatus: conditional.status,
      cdnCacheStatus: response.headers.get("cf-cache-status"),
      coreWarningImplemented: false,
    },
    null,
    2,
  ),
)
