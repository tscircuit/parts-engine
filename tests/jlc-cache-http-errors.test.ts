import { afterEach, expect, test } from "bun:test"
import {
  cache,
  getJlcPartsCached,
} from "../lib/jlc-parts-engine/jlc-parts-cache"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  cache.clear()
})

test.each([429, 503])(
  "failed HTTP response %s does not poison later lookups",
  async (status) => {
    cache.clear()
    let requests = 0
    globalThis.fetch = Object.assign(
      async () => {
        requests++
        return requests === 1
          ? Response.json({ error: "Temporarily unavailable" }, { status })
          : Response.json({ chips: [{ lcsc: 222 }] })
      },
      { preconnect: originalFetch.preconnect },
    )

    await expect(
      getJlcPartsCached("chips", { package: "SOT-23" }),
    ).rejects.toThrow(String(status))
    expect(cache.size).toBe(0)
    expect(await getJlcPartsCached("chips", { package: "SOT-23" })).toEqual({
      chips: [{ lcsc: 222 }],
    })
    expect(await getJlcPartsCached("chips", { package: "SOT-23" })).toEqual({
      chips: [{ lcsc: 222 }],
    })
    expect(requests).toBe(2)
  },
)
