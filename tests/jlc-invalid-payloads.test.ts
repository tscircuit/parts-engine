import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import type { AnySourceComponent } from "circuit-json"
import {
  JlcPcbPartsEngine,
  cache,
  jlcPartsEngine,
} from "../lib/jlc-parts-engine"
import { getJlcPartsCached } from "../lib/jlc-parts-engine/jlc-parts-cache"

const originalFetch = globalThis.fetch

const sampleCapacitor: AnySourceComponent = {
  type: "source_component",
  ftype: "simple_capacitor",
  capacitance: 100e-9,
  source_component_id: "source_component_0",
  name: "C1",
}

describe("jlcsearch invalid payload handling", () => {
  beforeEach(() => {
    cache.clear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("reports HTML responses instead of raw JSON SyntaxError and allows retry", async () => {
    let attemptCount = 0
    globalThis.fetch = (async () => {
      attemptCount += 1
      if (attemptCount === 1) {
        return new Response(
          "<!DOCTYPE html><html><body>Bad Gateway</body></html>",
          {
            status: 200,
            headers: { "content-type": "text/html" },
          },
        )
      }
      return new Response(
        JSON.stringify({ capacitors: [{ lcsc: "1525", is_basic: true }] }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      )
    }) as unknown as typeof fetch

    await expect(
      jlcPartsEngine.findPart({
        sourceComponent: sampleCapacitor,
        footprinterString: "0402",
      }),
    ).rejects.toThrow("Received HTML response instead of JSON")

    const recoveredResult = await jlcPartsEngine.findPart({
      sourceComponent: sampleCapacitor,
      footprinterString: "0402",
    })
    expect(recoveredResult).toEqual({ jlcpcb: ["C1525"] })
    expect(attemptCount).toBe(2)
  })

  test("rejects non-OK HTTP responses with status context and does not cache failures", async () => {
    let attemptCount = 0
    globalThis.fetch = (async () => {
      attemptCount += 1
      if (attemptCount === 1) {
        return new Response("<!DOCTYPE html><html>502 Bad Gateway</html>", {
          status: 502,
        })
      }
      return new Response(JSON.stringify({ capacitors: [{ lcsc: "2345" }] }), {
        status: 200,
      })
    }) as unknown as typeof fetch

    await expect(
      getJlcPartsCached("capacitors", {
        capacitance: 100e-9,
        package: "0402",
      }),
    ).rejects.toThrow(
      "Failed to fetch from jlcsearch (502): Received HTML response instead of JSON",
    )

    const secondAttempt = await getJlcPartsCached("capacitors", {
      capacitance: 100e-9,
      package: "0402",
    })
    expect(secondAttempt).toEqual({ capacitors: [{ lcsc: "2345" }] })
    expect(attemptCount).toBe(2)
  })

  test("rejects non-object JSON payloads and non-array category fields", async () => {
    for (const invalidPayload of [
      "null",
      "[]",
      "123",
      JSON.stringify({ capacitors: "invalid-list" }),
      JSON.stringify({ error: "Database connection failed" }),
    ]) {
      cache.clear()
      globalThis.fetch = (async () =>
        new Response(invalidPayload, {
          status: 200,
          headers: { "content-type": "application/json" },
        })) as unknown as typeof fetch

      await expect(
        jlcPartsEngine.findPart({
          sourceComponent: sampleCapacitor,
          footprinterString: "0402",
        }),
      ).rejects.toThrow("Invalid payload from jlcsearch")
    }
  })

  test("handles 'Not found' string payload and filters out entries missing lcsc numbers", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify("Not found"), {
        status: 200,
      })) as unknown as typeof fetch

    const notFoundResult = await jlcPartsEngine.findPart({
      sourceComponent: sampleCapacitor,
      footprinterString: "0402",
    })
    expect(notFoundResult).toEqual({ jlcpcb: [] })

    cache.clear()
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          capacitors: [
            null,
            {},
            { lcsc: "" },
            { lcsc: "9999", is_basic: false },
            { lcsc: "1111", is_basic: true },
          ],
        }),
        { status: 200 },
      )) as unknown as typeof fetch

    const filteredResult = await jlcPartsEngine.findPart({
      sourceComponent: sampleCapacitor,
      footprinterString: "0402",
    })
    expect(filteredResult).toEqual({ jlcpcb: ["C1111", "C9999"] })
  })

  test("returns unknown availability when jlcsearch returns HTML on 200 OK", async () => {
    const engine = new JlcPcbPartsEngine({
      platformFetch: async () =>
        new Response("<!DOCTYPE html><html>Error</html>", { status: 200 }),
    })

    const availability = await engine.fetchPartAvailability({
      supplierName: "jlcpcb",
      supplierPartNumber: "C1525",
    })

    expect(availability).toMatchObject({
      stock: null,
      price: null,
      currency: null,
    })
  })
})
