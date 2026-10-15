import { expect, test } from "bun:test"
import { JlcPcbPartsEngine } from "../index"
import type { PlatformFetch } from "../lib/platform-fetch"
import raw from "./fixtures/C318884.raweasy.json"

test("C318884 enrichment maps manufacturer A-B and C-D pairs to the EasyEDA source ports", async () => {
  const platformFetch: PlatformFetch = async (input) => {
    const url = new URL(String(input))
    if (url.pathname.endsWith("/datasheets/get"))
      return Response.json({
        datasheet: {
          datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
          chip_name: "TS-1187A-B-A-B",
          pin_attributes: null,
          pin_information: ["A", "B", "C", "D"].map((pin_number) => ({
            pin_number,
            name: [pin_number],
            description: "Contact",
            capabilities: [],
          })),
          internally_connected_pins: [
            ["A", "B"],
            ["C", "D"],
          ],
        },
      })
    if (url.pathname === "/api/components/search")
      return Response.json({
        success: true,
        result: { lists: { lcsc: [raw] } },
      })
    if (url.pathname === `/api/components/${raw.uuid}`)
      return Response.json({ success: true, result: raw })
    if (url.hostname === "modelcdn.tscircuit.com")
      return new Response(null, { status: 404 })
    throw Error(`Unexpected fetch: ${url}`)
  }
  const engine = new JlcPcbPartsEngine({ platformFetch })
  const circuitJson = (await engine.fetchPartCircuitJson({
    supplierPartNumber: "C318884",
    manufacturerPartNumber: "TS-1187A-B-A-B",
    includeDatasheetInformation: true,
  }))!
  const component = circuitJson.find(
    (element) => element.type === "source_component",
  )!
  const ports = circuitJson.filter((element) => element.type === "source_port")
  expect(
    component.internally_connected_source_port_ids?.map((group) =>
      group.map(
        (id) => ports.find((port) => port.source_port_id === id)!.pin_number,
      ),
    ),
  ).toEqual([
    [1, 2],
    [3, 4],
  ])
  // The supplier converter currently represents this footprint as a chip.
  expect(component.ftype).toBe("simple_chip")
})
