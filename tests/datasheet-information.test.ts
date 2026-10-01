import { afterEach, expect, mock, spyOn, test } from "bun:test"
import { commonComponentProps } from "@tscircuit/props"
import {
  DigiKeyPartsEngine,
  JlcPcbPartsEngine,
  MouserPartsEngine,
} from "../index"

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
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  for (let i = 0; i < 257; i++) {
    await engine.fetchDatasheetInformation({
      manufacturerPartNumber: `REG-${i}`,
    })
  }
  await engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-256" })
  expect(platformFetch).toHaveBeenCalledTimes(257)
  await engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-0" })
  expect(platformFetch).toHaveBeenCalledTimes(258)
})

for (const Engine of [
  JlcPcbPartsEngine,
  DigiKeyPartsEngine,
  MouserPartsEngine,
]) {
  test(`${Engine.name} only loads stored datasheets when enabled`, async () => {
    const platformFetch = mock(async (_input: unknown) => response())
    const disabled = new Engine({ platformFetch })
    expect(
      await disabled.fetchDatasheetInformation({
        manufacturerPartNumber: "REG-2V8",
      }),
    ).toBeUndefined()
    expect(platformFetch).not.toHaveBeenCalled()
    const enabled = new Engine({
      platformFetch,
      includeDatasheetInformation: true,
    })
    expect(
      await enabled.fetchDatasheetInformation({
        manufacturerPartNumber: "REG-2V8",
        includeDatasheetInformation: false,
      }),
    ).toBeUndefined()
    expect(platformFetch).not.toHaveBeenCalled()
    for (const manufacturerPartNumber of ["", "---", "!!!"]) {
      expect(
        await enabled.fetchDatasheetInformation({ manufacturerPartNumber }),
      ).toBeUndefined()
    }
    expect(platformFetch).not.toHaveBeenCalled()
    const result = await enabled.fetchDatasheetInformation({
      manufacturerPartNumber: "REG-2V8",
    })
    expect(result).toMatchObject({
      pinAttributes: datasheet.pin_attributes,
      pinInformation: datasheet.pin_information,
      footprinterString: "sot23",
      generatedTsx: datasheet.generated_tsx,
    })
    expect(platformFetch.mock.calls[0]?.[0]).toBe(
      "https://api.tscircuit.com/datasheets/get?chip_name=reg-2v8",
    )
    await disabled.fetchDatasheetInformation({
      manufacturerPartNumber: "REG-2V8",
      includeDatasheetInformation: true,
    })
    expect(platformFetch).toHaveBeenCalledTimes(2)
  })
}

test("concurrent normalized lookups share a request but not mutable returned attributes", async () => {
  const platformFetch = mock(async (_input: unknown) => response())
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  const results = await Promise.all(
    ["REG-2V8", "reg-2v8", " REG-2V8 "].map((manufacturerPartNumber) =>
      engine.fetchDatasheetInformation({ manufacturerPartNumber }),
    ),
  )
  expect(platformFetch).toHaveBeenCalledTimes(1)
  results[0]!.pinAttributes!.pin3!.providesVoltage = 1.8
  expect(results[1]!.pinAttributes!.pin3!.providesVoltage).toBe("2.8V")
  expect(
    (await engine.fetchDatasheetInformation({
      manufacturerPartNumber: "REG-2V8",
    }))!.pinAttributes!.pin3!.providesVoltage,
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
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  const load = () =>
    engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-2V8" })
  expect(await load()).toBeUndefined()
  await expect(load()).rejects.toThrow("503")
  await expect(load()).rejects.toThrow()
  await expect(load()).rejects.toThrow("different chip")
  expect((await load())?.pinAttributes).toEqual(datasheet.pin_attributes)
  expect(platformFetch).toHaveBeenCalledTimes(5)
})

test("network failures are retried and fetch receives a bounded abort signal", async () => {
  const platformFetch = mock(async (_url: any, init: any) => {
    expect(init.signal).toBeInstanceOf(AbortSignal)
    if (platformFetch.mock.calls.length === 1) throw new Error("network down")
    return response()
  })
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  await expect(
    engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-2V8" }),
  ).rejects.toThrow("network down")
  expect(
    (
      await engine.fetchDatasheetInformation({
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
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  const load = () =>
    engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-2V8" })
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
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  const load = () =>
    engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-2V8" })
  await Promise.all([load(), load()])
  expect(platformFetch).toHaveBeenCalledTimes(1)
  await load()
  expect(platformFetch).toHaveBeenCalledTimes(2)
})

test("custom endpoint and fetch overrides have isolated caches", async () => {
  const defaultFetch = mock(async (_input: unknown) => response())
  const overrideFetch = mock(async (_input: unknown) => response())
  const engine = new JlcPcbPartsEngine({
    platformFetch: defaultFetch,
    includeDatasheetInformation: true,
    datasheetApiBaseUrl: "https://datasheets.example.test",
  })
  await engine.fetchDatasheetInformation({ manufacturerPartNumber: "REG-2V8" })
  await engine.fetchDatasheetInformation({
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
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    includeDatasheetInformation: true,
  })
  expect(
    (
      await engine.fetchDatasheetInformation({
        manufacturerPartNumber: "REG-2V8",
      })
    )?.pinAttributes,
  ).toBeUndefined()
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
  expect(
    (
      await engine.fetchDatasheetInformation({
        manufacturerPartNumber: "REG-2V8",
        platformFetch: futureFetch,
      })
    )?.pinAttributes,
  ).toEqual(
    commonComponentProps.shape.pinAttributes.unwrap().parse(suppliedAttributes),
  )
})
