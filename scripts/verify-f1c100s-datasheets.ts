/** Read-only live check: bun scripts/verify-f1c100s-datasheets.ts */
import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine/JlcPartsEngine"

const fixtures = join(import.meta.dir, "../tests/fixtures/f1c100s")
const engine = new JlcPcbPartsEngine({ includeDatasheetInformation: true })
const results = []
for (const filename of (await readdir(fixtures)).filter((f) =>
  f.endsWith(".raweasy.json"),
)) {
  const raw = JSON.parse(await readFile(join(fixtures, filename), "utf8"))
  const manufacturerPartNumber = raw.dataStr.head.c_para["Manufacturer Part"]
  const supplierPartNumber = raw.lcsc.number
  const stored = JSON.parse(
    await readFile(
      join(fixtures, `${manufacturerPartNumber}.datasheet.json`),
      "utf8",
    ),
  ).datasheet
  const information = await engine.fetchDatasheetInformation({
    manufacturerPartNumber,
  })
  assert.ok(information, `${manufacturerPartNumber}: API record is missing`)
  assert.deepEqual(information.pinAttributes, stored.pin_attributes)
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
  for (const port of ports) {
    const attributes = Object.keys(port).filter((key) =>
      /^(is_|can_use_|requires_|provides_|do_not_connect|must_be_connected|supports_|should_have_)/.test(
        key,
      ),
    )
    assert.ok(
      attributes.length,
      `${manufacturerPartNumber}: pin${port.pin_number} has no electrical attributes`,
    )
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
    datasheetId: information.datasheetId,
  })
  console.error(`Verified ${manufacturerPartNumber}: ${ports.length} pins`)
}
const old = await engine.fetchDatasheetInformation({
  manufacturerPartNumber: "AP2112K-1.8TRG1",
})
assert.equal(old?.pinAttributes?.pin5?.providesVoltage, 1.8)
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
