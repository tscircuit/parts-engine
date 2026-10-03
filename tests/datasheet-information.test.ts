import { afterEach, expect, mock, spyOn, test } from "bun:test"
import { any_circuit_element } from "circuit-json"
import { createDatasheetInformationLoader } from "../index"

const datasheet = {
  datasheet_id: "9bb0a071-58c6-42e8-a961-ef7599d141bc",
  chip_name: "REG-2V8",
  pin_information: [
    {
      pin_number: "3",
      name: ["VOUT"],
      description: "Output",
      capabilities: ["power"],
    },
  ],
  pin_attributes: { pin3: { providesPower: true, providesVoltage: "2.8V" } },
  footprinter_string: "sot23",
  generated_tsx: 'export default () => <chip name="U1" footprint="sot23" />',
}
const response = (headers: Record<string, string> = {}) =>
  Response.json({ datasheet }, { headers })

afterEach(() => mock.restore())

test("datasheet caches are bounded to 256 distinct chips", async () => {
  const platformFetch = mock(async (input: unknown) =>
    Response.json({
      datasheet: {
        ...datasheet,
        chip_name: new URL(String(input)).searchParams.get("chip_name"),
      },
    }),
  )
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  for (let i = 0; i < 257; i++) {
    await engine({
      manufacturerPartNumber: `REG-${i}`,
    })
  }
  await engine({ manufacturerPartNumber: "REG-256" })
  expect(platformFetch).toHaveBeenCalledTimes(257)
  await engine({ manufacturerPartNumber: "REG-0" })
  expect(platformFetch).toHaveBeenCalledTimes(258)
})

test("datasheet lookup works independently of any supplier engine", async () => {
  const registryFetch = mock(async (_input: unknown) => response())
  const fetchDatasheetInformation = createDatasheetInformationLoader({
    platformFetch: registryFetch,
  })
  for (const manufacturerPartNumber of ["", "---", "!!!"])
    expect(
      await fetchDatasheetInformation({ manufacturerPartNumber }),
    ).toBeUndefined()
  expect(registryFetch).not.toHaveBeenCalled()
  const result = await fetchDatasheetInformation({
    manufacturerPartNumber: "REG-2V8",
  })
  expect(result).toMatchObject({
    footprinterString: "sot23",
    generatedTsx: datasheet.generated_tsx,
  })
  expect(
    result!.circuitJson.find((e) => e.type === "source_port"),
  ).toMatchObject({
    pin_number: 3,
    provides_voltage: "2.8V",
    provides_power: true,
  })
  for (const element of result!.circuitJson)
    expect(any_circuit_element.parse(element)).toEqual(element)
  expect(registryFetch.mock.calls[0]?.[0]).toBe(
    "https://api.tscircuit.com/datasheets/get?chip_name=reg-2v8",
  )
})

test("concurrent normalized lookups share a request but not mutable returned attributes", async () => {
  const platformFetch = mock(async (_input: unknown) => response())
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  const results = await Promise.all(
    ["REG-2V8", "reg-2v8", " REG-2V8 "].map((manufacturerPartNumber) =>
      engine({ manufacturerPartNumber }),
    ),
  )
  expect(platformFetch).toHaveBeenCalledTimes(1)
  const firstPort = results[0]!.circuitJson.find(
    (e) => e.type === "source_port",
  )!
  firstPort.provides_voltage = 1.8
  expect(
    results[1]!.circuitJson.find((e) => e.type === "source_port")!
      .provides_voltage,
  ).toBe("2.8V")
  expect(
    (await engine({
      manufacturerPartNumber: "REG-2V8",
    }))!.circuitJson.find((e) => e.type === "source_port")!.provides_voltage,
  ).toBe("2.8V")
})

test("missing, failed, malformed and mismatched datasheets do not poison later requests", async () => {
  const replies = [
    new Response(null, { status: 404 }),
    new Response(null, { status: 503 }),
    Response.json({
      datasheet: {
        ...datasheet,
        pin_attributes: { pin3: { providesVoltage: false } },
      },
    }),
    Response.json({ datasheet: { ...datasheet, chip_name: "REG-1V8" } }),
    response(),
  ]
  const platformFetch = mock(async (_input: unknown) => replies.shift()!)
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  const load = () => engine({ manufacturerPartNumber: "REG-2V8" })
  expect(await load()).toBeUndefined()
  await expect(load()).rejects.toThrow("503")
  await expect(load()).rejects.toThrow()
  await expect(load()).rejects.toThrow("different chip")
  expect(
    (await load())?.circuitJson.find((e) => e.type === "source_port"),
  ).toMatchObject({ provides_voltage: "2.8V" })
  expect(platformFetch).toHaveBeenCalledTimes(5)
})

test("network failures are retried and fetch receives a bounded abort signal", async () => {
  const platformFetch = mock(async (_url: any, init: any) => {
    expect(init.signal).toBeInstanceOf(AbortSignal)
    if (platformFetch.mock.calls.length === 1) throw new Error("network down")
    return response()
  })
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  await expect(engine({ manufacturerPartNumber: "REG-2V8" })).rejects.toThrow(
    "network down",
  )
  expect(
    (
      await engine({
        manufacturerPartNumber: "REG-2V8",
      })
    )?.chipName,
  ).toBe("REG-2V8")
})

test("cache lifetime accounts for HTTP Age and expires for corrected attributes", async () => {
  let now = 1_000_000
  spyOn(Date, "now").mockImplementation(() => now)
  const platformFetch = mock(async (_input: unknown) =>
    response({ "Cache-Control": "public, max-age=60", Age: "55" }),
  )
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  const load = () => engine({ manufacturerPartNumber: "REG-2V8" })
  await load()
  now += 4_999
  await load()
  expect(platformFetch).toHaveBeenCalledTimes(1)
  now += 1
  await load()
  expect(platformFetch).toHaveBeenCalledTimes(2)
})

test("no-store responses are not retained after concurrent requests settle", async () => {
  const platformFetch = mock(async (_input: unknown) =>
    response({ "Cache-Control": "no-store" }),
  )
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  const load = () => engine({ manufacturerPartNumber: "REG-2V8" })
  await Promise.all([load(), load()])
  expect(platformFetch).toHaveBeenCalledTimes(1)
  await load()
  expect(platformFetch).toHaveBeenCalledTimes(2)
})

test("custom endpoint and fetch overrides have isolated caches", async () => {
  const defaultFetch = mock(async (_input: unknown) => response())
  const overrideFetch = mock(async (_input: unknown) => response())
  const engine = createDatasheetInformationLoader({
    platformFetch: defaultFetch,
    datasheetApiBaseUrl: "https://datasheets.example.test",
  })
  await engine({ manufacturerPartNumber: "REG-2V8" })
  await engine({
    manufacturerPartNumber: "REG-2V8",
    platformFetch: overrideFetch,
  })
  expect(defaultFetch).toHaveBeenCalledTimes(1)
  expect(overrideFetch).toHaveBeenCalledTimes(1)
  expect(overrideFetch.mock.calls[0]?.[0]).toBe(
    "https://datasheets.example.test/datasheets/get?chip_name=reg-2v8",
  )
})

test("old records remain valid and pin attributes use the unmodified props schema", async () => {
  const platformFetch = mock(async (_input: unknown) =>
    Response.json({
      datasheet: {
        datasheet_id: datasheet.datasheet_id,
        chip_name: datasheet.chip_name,
      },
    }),
  )
  const engine = createDatasheetInformationLoader({
    platformFetch,
  })
  expect(
    (
      await engine({
        manufacturerPartNumber: "REG-2V8",
      })
    )?.circuitJson.filter((e) => e.type === "source_port"),
  ).toEqual([])
  const suppliedAttributes = {
    VOUT: { providesVoltage: 2.8, futureAttribute: true },
    "~RESET": { isInput: true, mustBeConnected: false },
    GPIO0: { isGpio: true, capabilities: ["i2c_sda"], isBidirectional: true },
  }
  const futureFetch = mock(async (_input: unknown) =>
    Response.json({
      datasheet: {
        ...datasheet,
        pin_attributes: suppliedAttributes,
      },
    }),
  )
  const result = await engine({
    manufacturerPartNumber: "REG-2V8",
    platformFetch: futureFetch,
  })
  const ports = result!.circuitJson.filter((e) => e.type === "source_port")
  expect(ports.find((p) => p.name === "VOUT")).toMatchObject({
    provides_voltage: 2.8,
  })
  expect(ports.find((p) => p.name === "VOUT")).not.toHaveProperty(
    "futureAttribute",
  )
  expect(ports.find((p) => p.name === "~RESET")).toMatchObject({
    is_input: true,
    must_be_connected: false,
  })
  expect(ports.find((p) => p.name === "GPIO0")).toMatchObject({
    is_gpio: true,
    is_bidirectional: true,
    supports_i2c_sda: true,
  })
})

for (const stalledPhase of ["fetch", "body"] as const) {
  test(`5-second deadline bounds a stalled ${stalledPhase} even if custom transport ignores abort`, async () => {
    const controller = new AbortController()
    const timeout = spyOn(AbortSignal, "timeout").mockReturnValue(
      controller.signal,
    )
    let markStalled = () => {}
    const stalled = new Promise<void>((resolve) => {
      markStalled = resolve
    })
    const platformFetch = mock(async () => {
      if (stalledPhase === "fetch") {
        markStalled()
        return new Promise<Response>(() => {})
      }
      const reply = response()
      Object.defineProperty(reply, "json", {
        value: () => {
          markStalled()
          return new Promise(() => {})
        },
      })
      return reply
    })
    const load = createDatasheetInformationLoader({ platformFetch })
    const pending = load({ manufacturerPartNumber: "REG-2V8" })
    await stalled
    controller.abort()
    await expect(pending).rejects.toThrow("did not respond within 5 seconds")
    expect(timeout).toHaveBeenCalledWith(5_000)
    timeout.mockRestore()
    platformFetch.mockImplementation(async () => response())
    expect(await load({ manufacturerPartNumber: "REG-2V8" })).toBeDefined()
  })
}

test("duplicate physical contacts reject conversion and are not cached", async () => {
  const platformFetch = mock(async () =>
    platformFetch.mock.calls.length === 1
      ? Response.json({
          datasheet: {
            ...datasheet,
            pin_information: [
              ...datasheet.pin_information,
              ...datasheet.pin_information,
            ],
          },
        })
      : response(),
  )
  const load = createDatasheetInformationLoader({ platformFetch })
  await expect(load({ manufacturerPartNumber: "REG-2V8" })).rejects.toThrow(
    "Duplicate datasheet pin",
  )
  expect(await load({ manufacturerPartNumber: "REG-2V8" })).toBeDefined()
  expect(platformFetch).toHaveBeenCalledTimes(2)
})
