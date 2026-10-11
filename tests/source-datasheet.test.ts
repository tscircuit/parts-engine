import { expect, mock, test } from "bun:test"
import { source_datasheet, type AnyCircuitElement } from "circuit-json"
import { createDatasheetInformationLoader } from "../lib/datasheets/create-datasheet-information-loader"
import { enrichPartCircuitJsonWithDatasheet } from "../lib/datasheets/enrich-part-circuit-json-with-datasheet"
import { reconcileDatasheetCircuitJson } from "../lib/datasheets/reconcile-datasheet-circuit-json"

const datasheet = {
  datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
  chip_name: "RP2040",
  datasheet_pdf_urls: [
    "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf",
  ],
  ai_description: "Dual-core microcontroller with programmable I/O.",
}

const circuitJson: AnyCircuitElement[] = [
  {
    type: "source_component",
    ftype: "simple_chip",
    source_component_id: "u1",
    name: "U1",
    manufacturer_part_number: "RP2040",
  },
]

test("the existing registry lookup includes a validated source_datasheet", async () => {
  const platformFetch = mock(async () => Response.json({ datasheet }))
  const load = createDatasheetInformationLoader({ platformFetch })
  const result = await load({ manufacturerPartNumber: "RP2040" })
  const sourceDatasheet = result!.circuitJson.find(
    (element) => element.type === "source_datasheet",
  )!
  expect(sourceDatasheet).toEqual({
    type: "source_datasheet",
    source_datasheet_id: `source_datasheet:${datasheet.datasheet_id}`,
    manufacturer_part_number: "RP2040",
    datasheet_pdf_urls: datasheet.datasheet_pdf_urls,
    description: datasheet.ai_description,
  })
  expect(source_datasheet.parse(sourceDatasheet)).toEqual(sourceDatasheet)
  await load({ manufacturerPartNumber: "rp2040" })
  expect(platformFetch).toHaveBeenCalledTimes(1)
})

test("null and missing optional metadata produce an empty URL list and no description", async () => {
  for (const optionalFields of [
    {},
    { datasheet_pdf_urls: null, ai_description: null },
  ]) {
    const load = createDatasheetInformationLoader({
      platformFetch: async () =>
        Response.json({
          datasheet: {
            datasheet_id: datasheet.datasheet_id,
            chip_name: datasheet.chip_name,
            ...optionalFields,
          },
        }),
    })
    const result = await load({ manufacturerPartNumber: "RP2040" })
    const sourceDatasheet = result!.circuitJson.find(
      (element) => element.type === "source_datasheet",
    )!
    expect(sourceDatasheet).toMatchObject({ datasheet_pdf_urls: [] })
    expect(sourceDatasheet).not.toHaveProperty("description")
  }
})

test("enrichment preserves metadata, uses the override transport, and does not mutate imports", async () => {
  const defaultFetch = mock(async () => {
    throw new Error("Wrong fetch")
  })
  const platformFetch = mock(async () => Response.json({ datasheet }))
  const fetchDatasheetInformation = createDatasheetInformationLoader({
    platformFetch: defaultFetch,
  })
  const savedCircuit = structuredClone(circuitJson)
  const enriched = await enrichPartCircuitJsonWithDatasheet(
    { circuitJson, platformFetch },
    { fetchDatasheetInformation },
  )
  expect(
    enriched.filter((element) => element.type === "source_datasheet"),
  ).toHaveLength(1)
  expect(circuitJson).toEqual(savedCircuit)
  expect(defaultFetch).not.toHaveBeenCalled()
  const enrichedAgain = await enrichPartCircuitJsonWithDatasheet(
    { circuitJson: enriched, platformFetch },
    { fetchDatasheetInformation },
  )
  expect(enrichedAgain).toEqual(enriched)
  expect(platformFetch).toHaveBeenCalledTimes(1)
})

test("reconciliation replaces matching metadata, preserves unrelated parts, and clones URLs", async () => {
  const load = createDatasheetInformationLoader({
    platformFetch: async () => Response.json({ datasheet }),
  })
  const registryCircuitJson = (await load({
    manufacturerPartNumber: "RP2040",
  }))!.circuitJson
  const existingDatasheet = {
    type: "source_datasheet" as const,
    source_datasheet_id: "old",
    manufacturer_part_number: "rp2040",
    datasheet_pdf_urls: [],
  }
  const unrelatedDatasheet = {
    ...existingDatasheet,
    source_datasheet_id: "other",
    manufacturer_part_number: "RP2350",
  }
  const result = reconcileDatasheetCircuitJson({
    circuitJson: [...circuitJson, existingDatasheet, unrelatedDatasheet],
    datasheetCircuitJson: registryCircuitJson,
  }).circuitJson
  const resultDatasheets = result.filter(
    (element) => element.type === "source_datasheet",
  )
  expect(resultDatasheets).toHaveLength(2)
  expect(resultDatasheets).toContainEqual(unrelatedDatasheet)
  const copiedDatasheet = resultDatasheets.find(
    (element) => element.manufacturer_part_number === "RP2040",
  )!
  copiedDatasheet.datasheet_pdf_urls.push("https://example.com/extra.pdf")
  expect(
    registryCircuitJson.find((element) => element.type === "source_datasheet")!
      .datasheet_pdf_urls,
  ).toHaveLength(1)
})

test("a missing datasheet leaves the imported circuit unchanged", async () => {
  const fetchDatasheetInformation = createDatasheetInformationLoader({
    platformFetch: async () => new Response(null, { status: 404 }),
  })
  expect(
    await enrichPartCircuitJsonWithDatasheet(
      { circuitJson },
      { fetchDatasheetInformation },
    ),
  ).toBe(circuitJson)
})

test("report resolved circuit-json dependency for lockfile validation", async () => {
  const lockfile = await Bun.file("bun.lock").text()
  console.log(lockfile.split("\n").find((line) => line.includes('["circuit-json@')))
})
