export type CapturedHttpRequest = {
  pathname: string
  method: string
  headers: Headers
  body: string
}

type FakeProxyServerOptions = {
  proxyStatusCode?: number
}

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"])

export class FakeProxyServer {
  private readonly proxyStatusCode: number
  private readonly capturedRequestsInternal: CapturedHttpRequest[] = []
  private server: Bun.Server | null = null

  public origin = ""

  constructor(options: FakeProxyServerOptions = {}) {
    this.proxyStatusCode = options.proxyStatusCode ?? 200
    this.handleRequest = this.handleRequest.bind(this)
  }

  public get capturedRequests(): readonly CapturedHttpRequest[] {
    return this.capturedRequestsInternal
  }

  public start(): void {
    if (this.server) {
      throw new Error("FakeProxyServer is already started")
    }

    this.server = Bun.serve({
      port: 0,
      fetch: this.handleRequest,
    })
    this.origin = `http://127.0.0.1:${this.server.port}`
  }

  public async stop(): Promise<void> {
    if (!this.server) return
    const startedServer = this.server
    this.server = null
    await startedServer.stop(true)
  }

  private async handleRequest(request: Request): Promise<Response> {
    const requestUrl = new URL(request.url)
    const requestBody = METHODS_WITHOUT_BODY.has(request.method)
      ? ""
      : await request.text()

    this.capturedRequestsInternal.push({
      pathname: requestUrl.pathname,
      method: request.method,
      headers: new Headers(request.headers),
      body: requestBody,
    })

    if (requestUrl.pathname === "/proxy") {
      return new Response(
        JSON.stringify({ proxied: this.proxyStatusCode === 200 }),
        {
          status: this.proxyStatusCode,
          headers: { "content-type": "application/json" },
        },
      )
    }

    if (requestUrl.pathname === "/passthrough") {
      return new Response("passthrough-ok", { status: 200 })
    }

    return new Response("not-found", { status: 404 })
  }
}
