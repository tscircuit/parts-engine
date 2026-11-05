import { expect, test } from "bun:test"
import { getFetchWithEasyEdaProxy } from "../lib/jlc-parts-engine/getFetchWithEasyEdaProxy"

test("EasyEDA proxy respects an already-aborted Request", async () => {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => new Response("should not complete"),
  })
  try {
    const controller = new AbortController()
    controller.abort()
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: globalThis.fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${server.port}/proxy`,
      },
    })
    const request = new Request("https://easyeda.com/api/components/search", {
      signal: controller.signal,
    })
    await expect(proxiedFetch(request)).rejects.toHaveProperty(
      "name",
      "AbortError",
    )
  } finally {
    await server.stop(true)
  }
})

test("EasyEDA proxy cancels an in-flight Request", async () => {
  const controller = new AbortController()
  let received = false
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => {
      received = true
      controller.abort()
      return new Promise<Response>((resolve) => {
        setTimeout(() => resolve(new Response("not cancelled")), 50)
      })
    },
  })
  try {
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: globalThis.fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${server.port}/proxy`,
      },
    })
    const request = new Request("https://easyeda.com/api/components/search", {
      signal: controller.signal,
    })
    await expect(proxiedFetch(request)).rejects.toHaveProperty(
      "name",
      "AbortError",
    )
    expect(received).toBe(true)
  } finally {
    await server.stop(true)
  }
})

test("EasyEDA proxy lets RequestInit override the Request signal", async () => {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => new Response("override accepted"),
  })
  try {
    const controller = new AbortController()
    controller.abort()
    const proxiedFetch = getFetchWithEasyEdaProxy({
      platformFetch: globalThis.fetch,
      easyEdaProxyConfig: {
        proxyEndpointUrl: `http://127.0.0.1:${server.port}/proxy`,
      },
    })
    const request = new Request("https://easyeda.com/api/components/search", {
      signal: controller.signal,
    })
    const response = await proxiedFetch(request, {
      signal: new AbortController().signal,
    })
    expect(await response.text()).toBe("override accepted")
  } finally {
    await server.stop(true)
  }
})
