import { expect, test } from "bun:test"
import {
  JlcPcbPartsEngine,
  getFetchWithEasyEdaProxy,
} from "../lib/jlc-parts-engine"
import { FakeProxyServer } from "./fixtures/FakeProxyServer"

const getFirstCapturedRequest = (fakeProxyServer: FakeProxyServer) => {
  const firstRequest = fakeProxyServer.capturedRequests[0]
  if (!firstRequest) throw new Error("Expected at least one captured request")
  return firstRequest
}

test("getFetchWithEasyEdaProxy routes EasyEDA API requests through /proxy", async () => {
  const fakeProxyServer = new FakeProxyServer()
  fakeProxyServer.start()

  try {
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: globalThis.fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `${fakeProxyServer.origin}/proxy`,
        headers: { "x-api-key": "test-key" },
      },
    })

    const response = await proxiedFetch(
      "https://easyeda.com/api/components/search",
      {
        method: "POST",
        headers: {
          origin: "https://easyeda.com",
          host: "https://easyeda.com",
          referer: "https://easyeda.com/editor",
          "user-agent": "test-user-agent",
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "type=3&wd=C165948",
      },
    )

    expect(response.ok).toBe(true)
    expect(fakeProxyServer.capturedRequests).toHaveLength(1)

    const firstRequest = getFirstCapturedRequest(fakeProxyServer)
    expect(firstRequest.pathname).toBe("/proxy")
    expect(firstRequest.method).toBe("POST")
    expect(firstRequest.headers.get("x-target-url")).toBe(
      "https://easyeda.com/api/components/search",
    )
    expect(firstRequest.headers.get("x-sender-origin")).toBe(
      "https://easyeda.com",
    )
    expect(firstRequest.headers.get("x-sender-host")).toBe(
      "https://easyeda.com",
    )
    expect(firstRequest.headers.get("x-sender-referer")).toBe(
      "https://easyeda.com/editor",
    )
    expect(firstRequest.headers.get("x-sender-user-agent")).toBe(
      "test-user-agent",
    )
    expect(firstRequest.headers.get("x-api-key")).toBe("test-key")
    expect(firstRequest.body).toContain("wd=C165948")
  } finally {
    await fakeProxyServer.stop()
  }
})

test("getFetchWithEasyEdaProxy leaves non-EasyEDA requests unchanged", async () => {
  const fakeProxyServer = new FakeProxyServer()
  fakeProxyServer.start()

  try {
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: globalThis.fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `${fakeProxyServer.origin}/proxy`,
      },
    })

    const response = await proxiedFetch(
      `${fakeProxyServer.origin}/passthrough`,
      {
        method: "GET",
      },
    )

    expect(response.ok).toBe(true)
    expect(await response.text()).toBe("passthrough-ok")
    expect(fakeProxyServer.capturedRequests).toHaveLength(1)

    const firstRequest = getFirstCapturedRequest(fakeProxyServer)
    expect(firstRequest.pathname).toBe("/passthrough")
  } finally {
    await fakeProxyServer.stop()
  }
})

test("JlcPcbPartsEngine applies EasyEDA proxy to fetchPartCircuitJson", async () => {
  const fakeProxyServer = new FakeProxyServer({
    proxyStatusCode: 500,
  })
  fakeProxyServer.start()

  const engine = new JlcPcbPartsEngine({
    platformFetch: globalThis.fetch,
    easyEdaProxyConfig: {
      proxyEndpointUrl: `${fakeProxyServer.origin}/proxy`,
    },
  })

  try {
    await expect(
      engine.fetchPartCircuitJson!({
        supplierPartNumber: "C165948",
      }),
    ).rejects.toThrow("Failed to search for the component")

    expect(fakeProxyServer.capturedRequests).toHaveLength(1)

    const firstRequest = getFirstCapturedRequest(fakeProxyServer)
    expect(firstRequest.pathname).toBe("/proxy")
    expect(firstRequest.headers.get("x-target-url")).toBe(
      "https://easyeda.com/api/components/search",
    )
  } finally {
    await fakeProxyServer.stop()
  }
})
