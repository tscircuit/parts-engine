import { describe, expect, test } from "bun:test"
import http from "node:http"
import { getFetchWithEasyEdaProxy } from "lib/jlc-parts-engine/getFetchWithEasyEdaProxy"

const EASYEDA_URL = "https://easyeda.com/api/components/test"

const startServer = async () => {
  const received: { aborted: boolean } = { aborted: false }
  const server = http.createServer((req, res) => {
    setTimeout(() => {
      received.aborted = req.destroyed
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ ok: true }))
    }, 200)
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const port = (server.address() as { port: number }).port
  return { server, port, received }
}

describe("EasyEDA proxy request cancellation", () => {
  test("already-aborted Request rejects immediately", async () => {
    const { server, port } = await startServer()
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${port}/proxy`,
      },
    })

    const controller = new AbortController()
    controller.abort()
    const request = new Request(EASYEDA_URL, { signal: controller.signal })

    await expect(proxiedFetch(request)).rejects.toThrow()
    server.close()
  })

  test("cancellation after the call propagates through the proxy", async () => {
    const { server, port } = await startServer()
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${port}/proxy`,
      },
    })

    const controller = new AbortController()
    const promise = proxiedFetch(
      new Request(EASYEDA_URL, { signal: controller.signal }),
    )
    setTimeout(() => controller.abort(), 50)

    await expect(promise).rejects.toThrow()
    server.close()
  })

  test("non-aborted request still succeeds", async () => {
    const { server, port } = await startServer()
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${port}/proxy`,
      },
    })

    const response = await proxiedFetch(
      new Request(EASYEDA_URL, { method: "POST", body: "x" }),
    )
    expect(response.status).toBe(200)
    server.close()
  })
})
