import { afterEach, expect, mock, spyOn, test } from "bun:test"
import {
  JlcPcbPartsEngine,
  DigiKeyPartsEngine,
  MouserPartsEngine,
  cache,
  digikeyCache,
  mouserCache,
  createDatasheetInformationLoader,
  type JlcPcbPartsEngineOptions,
  type DigiKeyPartsEngineOptions,
  type MouserPartsEngineOptions,
} from "../index"

const environmentNames = [
  "TSCIRCUIT_JLCSEARCH_BASE_URL",
  "TSCIRCUIT_DIGIKEY_BASE_URL",
  "TSCIRCUIT_MOUSER_BASE_URL",
  "TSCIRCUIT_DATASHEET_API_BASE_URL",
] as const
const originalBaseUrls = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
)
const datasheet = {
  datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
  chip_name: "REG-2V8",
  pin_information: [
    { pin_number: "1", name: ["VCC"], description: "Supply", capabilities: [] },
  ],
  pin_attributes: { pin1: { requiresPower: true } },
  generated_tsx: "export default () => <chip />",
}
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

afterEach(() => {
  mock.restore()
  cache.clear()
  digikeyCache.clear()
  mouserCache.clear()
  for (const name of environmentNames) {
    const originalBaseUrl = originalBaseUrls[name]
    if (originalBaseUrl === undefined) delete process.env[name]
    else process.env[name] = originalBaseUrl
  }
})

for (const mode of ["environment", "serialized options"] as const) {
  test(`all providers use local path prefixes from ${mode}`, async () => {
    const requests: URL[] = []
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        const url = new URL(request.url)
        requests.push(url)
        switch (url.pathname) {
          case "/baked/jlcsearch/resistors/list":
            return Response.json({ resistors: [{ lcsc: 1525 }] })
          case "/baked/digikey/resistors/list":
            return Response.json({
              resistors: [{ digikey_product_number: "R-DK", stock: 10 }],
            })
          case "/baked/mouser/resistors/list":
            return Response.json({
              resistors: [{ mouser_product_number: "R-MOUSER", stock: 10 }],
            })
          case "/baked/jlcsearch/api/search":
            return Response.json({ components: [{ lcsc: 1525, stock: 10 }] })
          case "/baked/datasheet-api/datasheets/get":
            return Response.json({ datasheet })
          default:
            return new Response(null, { status: 404 })
        }
      },
    })
    const origin = `http://127.0.0.1:${server.port}`
    const originalFetch = globalThis.fetch
    spyOn(globalThis, "fetch").mockImplementation(
      Object.assign(
        (
          input: Parameters<typeof fetch>[0],
          init?: Parameters<typeof fetch>[1],
        ) => {
          const url = new URL(
            input instanceof Request ? input.url : String(input),
          )
          if (url.origin !== origin)
            throw new Error(`Unexpected remote request: ${url}`)
          return originalFetch(input, init)
        },
        { preconnect: originalFetch.preconnect },
      ),
    )
    const jlcOptions: JlcPcbPartsEngineOptions =
      mode === "serialized options"
        ? JSON.parse(
            JSON.stringify({
              jlcSearchBaseUrl: `${origin}/baked/jlcsearch/`,
              datasheetApiBaseUrl: `${origin}/baked/datasheet-api/`,
            }),
          )
        : {}
    const digikeyOptions: DigiKeyPartsEngineOptions =
      mode === "serialized options"
        ? JSON.parse(JSON.stringify({ apiBaseUrl: `${origin}/baked/digikey/` }))
        : {}
    const mouserOptions: MouserPartsEngineOptions =
      mode === "serialized options"
        ? JSON.parse(JSON.stringify({ apiBaseUrl: `${origin}/baked/mouser/` }))
        : {}
    const jlc = new JlcPcbPartsEngine(jlcOptions)
    const digikey = new DigiKeyPartsEngine(digikeyOptions)
    const mouser = new MouserPartsEngine(mouserOptions)
    const loadDatasheet = createDatasheetInformationLoader(jlcOptions)
    // Set defaults after construction, as CLI bootstrap can follow module loading.
    for (const [name, prefix] of environmentNames.map((name, index) => [
      name,
      ["jlcsearch", "digikey", "mouser", "datasheet-api"][index],
    ])) {
      process.env[name!] =
        `${origin}/${mode === "environment" ? `baked/${prefix}` : "wrong"}`
    }

    try {
      const findJlcPart = jlc.findPart
      expect(await findJlcPart(resistorRequest)).toEqual({ jlcpcb: ["C1525"] })
      expect(await digikey.findPart(resistorRequest)).toEqual({
        digikey: ["R-DK"],
      })
      expect(await mouser.findPart(resistorRequest)).toEqual({
        mouser: ["R-MOUSER"],
      })
      expect(
        await jlc.fetchPartAvailability({
          supplierName: "jlcpcb",
          supplierPartNumber: "C1525",
        }),
      ).toMatchObject({ stock: 10 })
      const electrical = await loadDatasheet({
        manufacturerPartNumber: "REG-2V8",
      })
      expect(electrical?.generatedTsx).toBe(datasheet.generated_tsx)
      expect(
        electrical?.circuitJson.find(
          (element) => element.type === "source_port",
        ),
      ).toMatchObject({ requires_power: true })
      expect(requests.map((request) => request.pathname)).toEqual([
        "/baked/jlcsearch/resistors/list",
        "/baked/digikey/resistors/list",
        "/baked/mouser/resistors/list",
        "/baked/jlcsearch/api/search",
        "/baked/datasheet-api/datasheets/get",
      ])
      expect(requests[0]?.searchParams.get("resistance")).toBe("10000")
      expect(requests[3]?.searchParams.get("q")).toBe("C1525")
      expect(requests[4]?.searchParams.get("chip_name")).toBe("reg-2v8")
    } finally {
      await server.stop(true)
    }
  })
}

test("JLC cache separates base URLs with identical constraints", async () => {
  const requests: string[] = []
  const platformFetch = async (input: Parameters<typeof fetch>[0]) => {
    requests.push(String(input))
    return Response.json({ resistors: [{ lcsc: requests.length }] })
  }
  for (const prefix of ["first", "second"]) {
    const engine = new JlcPcbPartsEngine({
      jlcSearchBaseUrl: `http://localhost/baked/${prefix}`,
      platformFetch,
    })
    await engine.findPart(resistorRequest)
    await engine.findPart(resistorRequest)
  }
  expect(requests).toHaveLength(2)
  expect(new URL(requests[0]!).pathname).toBe("/baked/first/resistors/list")
  expect(new URL(requests[1]!).pathname).toBe("/baked/second/resistors/list")
})

test("datasheet cache separates changed environment base URLs", async () => {
  const requests: string[] = []
  const loadDatasheet = createDatasheetInformationLoader({
    platformFetch: async (input) => {
      requests.push(String(input))
      return Response.json({ datasheet })
    },
  })
  for (const prefix of ["first", "second"]) {
    process.env.TSCIRCUIT_DATASHEET_API_BASE_URL = `http://localhost/baked/${prefix}`
    await loadDatasheet({ manufacturerPartNumber: "REG-2V8" })
    await loadDatasheet({ manufacturerPartNumber: "REG-2V8" })
  }
  expect(requests).toHaveLength(2)
  expect(new URL(requests[0]!).pathname).toBe("/baked/first/datasheets/get")
  expect(new URL(requests[1]!).pathname).toBe("/baked/second/datasheets/get")
})
