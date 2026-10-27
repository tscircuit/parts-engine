import { afterEach, expect, mock, spyOn, test } from "bun:test"
import {
  JlcPcbPartsEngine,
  DigiKeyPartsEngine,
  MouserPartsEngine,
  cache,
  digikeyCache,
  mouserCache,
  type PlatformFetch,
} from "../index"

const resistorRequest = {
  sourceComponent: {
    type: "source_component" as const,
    source_component_id: "source_component_0",
    name: "R1",
    ftype: "simple_resistor" as const,
    resistance: 10_000,
  },
  footprinterString: "0402",
}

const providers = [
  {
    name: "jlcpcb",
    create: (platformFetch?: PlatformFetch) =>
      new JlcPcbPartsEngine({ platformFetch }),
    response: (id: number) => ({ resistors: [{ lcsc: id }] }),
    partNumber: (id: number) => `C${id}`,
    cache,
  },
  {
    name: "digikey",
    create: (platformFetch?: PlatformFetch) =>
      new DigiKeyPartsEngine({ platformFetch }),
    response: (id: number) => ({
      resistors: [{ digikey_product_number: `${id}-ND` }],
    }),
    partNumber: (id: number) => `${id}-ND`,
    cache: digikeyCache,
  },
  {
    name: "mouser",
    create: (platformFetch?: PlatformFetch) =>
      new MouserPartsEngine({ platformFetch }),
    response: (id: number) => ({
      resistors: [{ mouser_product_number: `MOUSER-${id}` }],
    }),
    partNumber: (id: number) => `MOUSER-${id}`,
    cache: mouserCache,
  },
]

afterEach(() => {
  mock.restore()
  for (const provider of providers) provider.cache.clear()
})

for (const provider of providers) {
  test(`${provider.name}: different fetch implementations do not reuse each other's results`, async () => {
    const firstFetch = mock(async () => Response.json(provider.response(101)))
    const secondFetch = mock(async () => Response.json(provider.response(202)))
    const first = provider.create(firstFetch)
    const second = provider.create(secondFetch)

    expect(await first.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(101)],
    })
    expect(await second.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(202)],
    })
    await first.findPart(resistorRequest)
    await second.findPart(resistorRequest)
    expect(firstFetch).toHaveBeenCalledTimes(1)
    expect(secondFetch).toHaveBeenCalledTimes(1)
  })

  test(`${provider.name}: default fetch and an injected fetch have separate results`, async () => {
    const defaultFetch = spyOn(globalThis, "fetch").mockImplementation(
      Object.assign(async () => Response.json(provider.response(101)), {
        preconnect: globalThis.fetch.preconnect,
      }),
    )
    const injectedFetch = mock(async () =>
      Response.json(provider.response(202)),
    )
    const defaultEngine = provider.create()
    const injectedEngine = provider.create(injectedFetch)

    expect(await defaultEngine.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(101)],
    })
    expect(await injectedEngine.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(202)],
    })
    expect(defaultFetch).toHaveBeenCalledTimes(1)
    expect(injectedFetch).toHaveBeenCalledTimes(1)
  })

  test(`${provider.name}: engines sharing one fetch still cache and can clear their results`, async () => {
    const urls: string[] = []
    const platformFetch: PlatformFetch = async (input) => {
      urls.push(String(input))
      return Response.json(provider.response(urls.length))
    }
    const first = provider.create(platformFetch)
    const second = provider.create(platformFetch)

    expect(await first.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(1)],
    })
    expect(await second.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(1)],
    })
    expect(urls).toHaveLength(1)

    provider.cache.clear()
    expect(await second.findPart(resistorRequest)).toEqual({
      [provider.name]: [provider.partNumber(2)],
    })
    expect(urls).toHaveLength(2)
    expect(urls[1]!).toBe(urls[0]!)
    const url = new URL(urls[0]!)
    expect(url.protocol).toBe("https:")
    expect(url.pathname).toBe("/resistors/list")
    expect(url.searchParams.get("resistance")).toBe("10000")
  })
}
