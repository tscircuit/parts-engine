import { afterEach, beforeEach, expect, test } from "bun:test"
import {
  cache,
  getJlcPartsCached,
} from "../lib/jlc-parts-engine/jlc-parts-cache"

const originalFetch = globalThis.fetch

beforeEach(() => {
  cache.clear()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test("coalesces identical concurrent JLC lookups", async () => {
  let fetchCount = 0
  let resolveFetch!: (response: Response) => void
  globalThis.fetch = (() => {
    fetchCount += 1
    return new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
  }) as unknown as typeof fetch

  const lookups = Array.from({ length: 87 }, () =>
    getJlcPartsCached("capacitors", {
      capacitance: 1e-7,
      package: "0402",
    }),
  )

  expect(fetchCount).toBe(1)
  resolveFetch(new Response(JSON.stringify({ capacitors: [{ lcsc: "1525" }] })))

  const results = await Promise.all(lookups)
  expect(results).toHaveLength(87)
  expect(results.every((result) => result.capacitors[0].lcsc === "1525")).toBe(
    true,
  )
})

test("allows a failed JLC lookup to be retried", async () => {
  let fetchCount = 0
  globalThis.fetch = (async () => {
    fetchCount += 1
    if (fetchCount === 1) throw new Error("temporary network failure")
    return new Response(JSON.stringify({ capacitors: [] }))
  }) as unknown as typeof fetch

  await expect(
    getJlcPartsCached("capacitors", {
      capacitance: 1e-7,
      package: "0402",
    }),
  ).rejects.toThrow("temporary network failure")

  await getJlcPartsCached("capacitors", {
    capacitance: 1e-7,
    package: "0402",
  })
  expect(fetchCount).toBe(2)
})
