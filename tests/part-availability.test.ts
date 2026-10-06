import { describe, expect, test } from "bun:test"
import { JlcPcbPartsEngine } from "../lib/jlc-parts-engine"
import type { FetchPartAvailabilityParams } from "@tscircuit/props"

const createEngine = (components: unknown[]) =>
  new JlcPcbPartsEngine({
    platformFetch: async () => Response.json({ components }),
  })
const request: FetchPartAvailabilityParams = {
  supplierName: "jlcpcb",
  supplierPartNumber: "C1525",
}

describe("JLC stock and price", () => {
  test("returns stock, lowest-quantity unit price, currency, and lookup timestamp", async () => {
    for (const quote of [
      { price: 0.006 },
      { price: "0.006" },
      { price1: 0.006, price: "invalid" },
      { price: '[{"qFrom":10,"price":0.001},{"qFrom":1,"price":0.006}]' },
      { price: "10-99:0.001,1-9:0.006" },
    ]) {
      const result = await createEngine([
        { lcsc: 1525, stock: 1234, ...quote },
      ]).fetchPartAvailability(request)
      expect(result).toMatchObject({
        stock: 1234,
        price: 0.006,
        currency: "USD",
      })
      expect(Number.isFinite(Date.parse(result!.checkedAt!))).toBe(true)
    }
  })
  test("preserves zeroes and represents missing or mismatched stock and price as unknown", async () => {
    expect(
      await createEngine([
        { lcsc: 1525, stock: 0, price: 0 },
      ]).fetchPartAvailability(request),
    ).toMatchObject({ stock: 0, price: 0, currency: "USD" })
    for (const components of [
      [],
      [{ lcsc: 999, stock: 100, price: 1 }],
      [{ lcsc: 1525, stock: null, price: "invalid" }],
    ]) {
      expect(
        await createEngine(components).fetchPartAvailability(request),
      ).toMatchObject({ stock: null, price: null, currency: null })
    }
    expect(
      await createEngine([
        { lcsc: 1525, stock: 100, price: null },
      ]).fetchPartAvailability(request),
    ).toMatchObject({ stock: 100, price: null, currency: null })
  })
  test("uses per-request fetch, normalizes part numbers, forwards cancellation, and fetches again", async () => {
    const calls: string[] = []
    const controller = new AbortController()
    const engine = new JlcPcbPartsEngine({
      platformFetch: async () => {
        throw new Error("Override expected")
      },
    })
    const availabilityRequest: FetchPartAvailabilityParams = {
      supplierName: "jlcpcb",
      supplierPartNumber: " 001525 ",
      signal: controller.signal,
      platformFetch: Object.assign(
        async (
          url: Parameters<typeof fetch>[0],
          options?: Parameters<typeof fetch>[1],
        ) => {
          calls.push(String(url))
          expect(options && "cache" in options && options.cache).toBe(
            "no-store",
          )
          expect(options?.signal?.aborted).toBe(false)
          controller.abort()
          expect(options?.signal?.aborted).toBe(true)
          return Response.json({
            components: [{ lcsc: 1525, stock: 10, price: 0.006 }],
          })
        },
        { preconnect: () => {} },
      ),
    }
    const detachedLookup = engine.fetchPartAvailability
    await detachedLookup(availabilityRequest)
    await detachedLookup({
      ...request,
      platformFetch: Object.assign(
        async (url: Parameters<typeof fetch>[0]) => {
          calls.push(String(url))
          return Response.json({ components: [] })
        },
        { preconnect: () => {} },
      ),
    })
    expect(calls).toEqual(
      Array(2).fill(
        "https://jlcsearch.tscircuit.com/api/search?q=C1525&limit=1",
      ),
    )
  })
  test("skips unsupported suppliers and rejects service failures", async () => {
    let calls = 0
    const engine = new JlcPcbPartsEngine({
      platformFetch: async () => {
        calls++
        return new Response(null, { status: 503 })
      },
    })
    expect(
      await engine.fetchPartAvailability({
        ...request,
        supplierName: "digikey",
      }),
    ).toBeUndefined()
    expect(calls).toBe(0)
    await expect(engine.fetchPartAvailability(request)).rejects.toThrow(
      "JLC availability lookup failed",
    )
    expect(calls).toBe(1)
    expect(
      await engine.fetchPartAvailability({
        ...request,
        supplierPartNumber: "not-a-part",
      }),
    ).toMatchObject({ stock: null, price: null, currency: null })
    expect(calls).toBe(1)
  })
})
