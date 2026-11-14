import { describe, expect, it } from "bun:test"
import { TrustedPartsInventoryClient } from "../lib/trustedparts/trustedparts-inventory-client"

const settings = {
  companyId: "company-fixture",
  apiKey: "secret-fixture",
  userAgent: "InternalFixture/1.0",
}
const queries = [{ searchToken: "LM358" }]

describe("TrustedPartsInventoryClient", () => {
  it("sends only a server-side authenticated JSON POST with documented fields", async () => {
    let request: { url: string; init?: RequestInit } | undefined
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async (url, init) => {
        request = { url: String(url), init }
        return Response.json({ Offers: [{ id: 5 }] })
      },
    })
    expect(
      await client.search({
        queries: [
          { searchToken: "LM358", manufacturers: ["Texas Instruments"] },
        ],
        countryCode: "US",
        currencyCode: "USD",
        sourceIp: "198.51.100.9",
      }),
    ).toEqual({ Offers: [{ id: 5 }] })
    expect(request?.url).toBe("https://api.trustedparts.com/v2/search")
    expect(request?.init?.method).toBe("POST")
    expect(request?.init?.headers).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
    })
    expect(JSON.parse(String(request?.init?.body))).toEqual({
      CompanyId: settings.companyId,
      ApiKey: settings.apiKey,
      Queries: [{ SearchToken: "LM358", Manufacturers: ["Texas Instruments"] }],
      InStockOnly: false,
      ExactMatch: true,
      IsCrawler: false,
      UseCachedData: true,
      UserAgent: settings.userAgent,
      SourceIp: "198.51.100.9",
      CountryCode: "US",
      CurrencyCode: "USD",
    })
  })

  it("does not cache completed responses by default", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () => Response.json({ call: ++calls }),
    })
    expect(await client.search({ queries })).toEqual({ call: 1 })
    expect(await client.search({ queries })).toEqual({ call: 2 })
  })

  it("coalesces simultaneous identical requests without persisting data", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () => {
        ++calls
        await Bun.sleep(10)
        return Response.json({ ok: true })
      },
    })
    const results = await Promise.all(
      Array.from({ length: 8 }, () => client.search({ queries })),
    )
    expect(results).toHaveLength(8)
    expect(
      results.every((item) => JSON.stringify(item) === '{"ok":true}'),
    ).toBe(true)
    expect(calls).toBe(1)
    await client.search({ queries })
    expect(calls).toBe(2)
  })

  it("rejects HTTP errors without caching or leaking response contents", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      cache: { explicitlyAuthorized: true, ttlMs: 500 },
      platformFetch: async () => {
        if (++calls === 1)
          return new Response("secret-fixture", { status: 429 })
        return Response.json({ ready: true })
      },
    })
    await expect(client.search({ queries })).rejects.toThrow("HTTP 429")
    expect(await client.search({ queries })).toEqual({ ready: true })
    expect(await client.search({ queries })).toEqual({ ready: true })
    expect(calls).toBe(2)
  })

  it("never shares a failed pending promise with a later request", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () => {
        if (++calls === 1) throw new Error("network offline")
        return Response.json({ recovered: true })
      },
    })
    await expect(client.search({ queries })).rejects.toThrow("network offline")
    expect(await client.search({ queries })).toEqual({ recovered: true })
  })

  it("isolates cache entries by visitor and geographic context", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      cache: { explicitlyAuthorized: true, ttlMs: 1000 },
      platformFetch: async () => Response.json({ call: ++calls }),
    })
    const base = { queries, sourceIp: "198.51.100.5", countryCode: "US" }
    expect(await client.search(base)).toEqual({ call: 1 })
    expect(await client.search(base)).toEqual({ call: 1 })
    expect(await client.search({ ...base, sourceIp: "198.51.100.6" })).toEqual({
      call: 2,
    })
    expect(await client.search({ ...base, countryCode: "CA" })).toEqual({
      call: 3,
    })
    client.clearCache()
    expect(await client.search(base)).toEqual({ call: 4 })
  })

  it("rejects invalid query sizes, ISO codes, and empty tokens before making requests", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () => {
        ++calls
        return Response.json({})
      },
    })
    await expect(client.search({ queries: [] })).rejects.toThrow("1 to 50")
    await expect(
      client.search({
        queries: Array.from({ length: 51 }, (_, i) => ({
          searchToken: "P" + i,
        })),
      }),
    ).rejects.toThrow("1 to 50")
    await expect(
      client.search({ queries: [{ searchToken: " " }] }),
    ).rejects.toThrow("at least two")
    await expect(
      client.search({ queries, countryCode: "United States" }),
    ).rejects.toThrow("countryCode")
    await expect(
      client.search({ queries, currencyCode: "USD1" }),
    ).rejects.toThrow("currencyCode")
    expect(calls).toBe(0)
  })

  it("enforces a 7-day maximum and explicit caching permission", () => {
    expect(
      () =>
        new TrustedPartsInventoryClient({
          ...settings,
          cache: { explicitlyAuthorized: true, ttlMs: 8 * 24 * 60 * 60 * 1000 },
        }),
    ).toThrow("caching requires authorization")
    expect(
      () =>
        new TrustedPartsInventoryClient({
          ...settings,
          cache: { explicitlyAuthorized: false as true, ttlMs: 1000 },
        }),
    ).toThrow("caching requires authorization")
    expect(
      () =>
        new TrustedPartsInventoryClient({
          ...settings,
          cache: { explicitlyAuthorized: true, ttlMs: 0 },
        }),
    ).toThrow("caching requires authorization")
  })

  it("rejects non-HTTPS endpoints and missing credentials", () => {
    expect(
      () =>
        new TrustedPartsInventoryClient({
          ...settings,
          endpoint: "http://trustedparts.example.test",
        }),
    ).toThrow("HTTPS")
    expect(
      () =>
        new TrustedPartsInventoryClient({
          ...settings,
          apiKey: "",
        }),
    ).toThrow("required")
  })

  it("does not coalesce independently abortable requests", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () => {
        ++calls
        return Response.json({ ok: true })
      },
    })
    const controller = new AbortController()
    await Promise.all([
      client.search({ queries, signal: controller.signal }),
      client.search({ queries }),
    ])
    expect(calls).toBe(2)
  })

  it("expires authorized cached supplier results without requiring another read", async () => {
    let calls = 0
    const client = new TrustedPartsInventoryClient({
      ...settings,
      cache: { explicitlyAuthorized: true, ttlMs: 15 },
      platformFetch: async () => Response.json({ call: ++calls }),
    })
    await client.search({ queries })
    // The cache is purged by its timer, not only lazily on the next request.
    await Bun.sleep(35)
    expect(
      (client as unknown as { cache: Map<string, unknown> }).cache.size,
    ).toBe(0)
    expect(await client.search({ queries })).toEqual({ call: 2 })
    client.clearCache()
  })

  it("returns independent copies of cached supplier objects", async () => {
    const client = new TrustedPartsInventoryClient({
      ...settings,
      cache: { explicitlyAuthorized: true, ttlMs: 1000 },
      platformFetch: async () => Response.json({ offers: [{ stock: 10 }] }),
    })
    const first = (await client.search({ queries })) as {
      offers: Array<{ stock: number }>
    }
    first.offers[0]!.stock = 0
    const second = (await client.search({ queries })) as typeof first
    expect(second.offers[0]!.stock).toBe(10)
    second.offers[0]!.stock = 8
    const third = (await client.search({ queries })) as typeof first
    expect(third.offers[0]!.stock).toBe(10)
    client.clearCache()
  })

  it("does not log or forward secret strings in a failed HTTP status", async () => {
    const client = new TrustedPartsInventoryClient({
      ...settings,
      platformFetch: async () =>
        new Response("Bearer secret-fixture", {
          status: 500,
        }),
    })
    try {
      await client.search({ queries })
      throw new Error("Expected HTTP error")
    } catch (error) {
      expect(String(error)).not.toContain(settings.apiKey)
      expect(String(error)).toContain("HTTP 500")
    }
  })
})
