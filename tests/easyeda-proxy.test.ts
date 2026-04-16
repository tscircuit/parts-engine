import { expect, test } from "bun:test"
import {
  JlcPcbPartsEngine,
  fetchWithEasyEdaProxy,
} from "../lib/jlc-parts-engine"

type FetchCall = {
  input: Parameters<typeof fetch>[0]
  init?: RequestInit
}

const createFetchSpy = () => {
  const calls: FetchCall[] = []
  const platformFetch = (async (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit,
  ) => {
    calls.push({ input, init })
    return new Response("{}", { status: 500 })
  }) as typeof fetch
  return { calls, platformFetch }
}

test("fetchWithEasyEdaProxy routes EasyEDA API requests through /proxy", async () => {
  const { calls, platformFetch } = createFetchSpy()

  const proxiedFetch = fetchWithEasyEdaProxy({
    platformFetch,
    easyEdaProxy: {
      proxyEndpointUrl: "https://api.example.com/proxy",
      headers: { "x-api-key": "test-key" },
    },
  })

  await proxiedFetch("https://easyeda.com/api/components/search", {
    method: "POST",
    headers: {
      origin: "https://easyeda.com",
      host: "https://easyeda.com",
      referer: "https://easyeda.com/editor",
      "user-agent": "test-user-agent",
      "content-type": "application/x-www-form-urlencoded",
    },
  })

  expect(calls).toHaveLength(1)
  const firstCall = calls[0]
  if (!firstCall) throw new Error("Expected first proxied fetch call")

  expect(firstCall.input).toBe("https://api.example.com/proxy")

  const headers = new Headers(firstCall.init?.headers)
  expect(headers.get("x-target-url")).toBe(
    "https://easyeda.com/api/components/search",
  )
  expect(headers.get("x-sender-origin")).toBe("https://easyeda.com")
  expect(headers.get("x-sender-host")).toBe("https://easyeda.com")
  expect(headers.get("x-sender-referer")).toBe("https://easyeda.com/editor")
  expect(headers.get("x-sender-user-agent")).toBe("test-user-agent")
  expect(headers.get("x-api-key")).toBe("test-key")
})

test("fetchWithEasyEdaProxy leaves non-EasyEDA requests unchanged", async () => {
  const { calls, platformFetch } = createFetchSpy()

  const proxiedFetch = fetchWithEasyEdaProxy({
    platformFetch,
    easyEdaProxy: {
      proxyEndpointUrl: "https://api.example.com",
    },
  })

  await proxiedFetch("https://example.com/api/data", { method: "GET" })

  expect(calls).toHaveLength(1)
  const firstCall = calls[0]
  if (!firstCall) throw new Error("Expected first passthrough fetch call")

  expect(firstCall.input).toBe("https://example.com/api/data")
  expect(firstCall.init?.method).toBe("GET")
})

test("JlcPcbPartsEngine applies EasyEDA proxy to fetchPartCircuitJson", async () => {
  const { calls, platformFetch } = createFetchSpy()
  const engine = new JlcPcbPartsEngine({
    platformFetch,
    easyEdaProxy: {
      proxyEndpointUrl: "https://api.example.com/proxy",
    },
  })

  await expect(
    engine.fetchPartCircuitJson!({
      supplierPartNumber: "C165948",
    }),
  ).rejects.toThrow("Failed to search for the component")

  expect(calls).toHaveLength(1)
  const firstCall = calls[0]
  if (!firstCall) throw new Error("Expected first engine fetch call")

  expect(firstCall.input).toBe("https://api.example.com/proxy")
  const headers = new Headers(firstCall.init?.headers)
  expect(headers.get("x-target-url")).toBe(
    "https://easyeda.com/api/components/search",
  )
})
