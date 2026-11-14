import type { PlatformFetch } from "../platform-fetch"

const DEFAULT_ENDPOINT = "https://api.trustedparts.com/v2/search"
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export type TrustedPartsQuery = {
  searchToken: string
  manufacturers?: string[]
}

export type TrustedPartsSearchRequest = {
  queries: TrustedPartsQuery[]
  userAgent?: string
  sourceIp?: string
  countryCode?: string
  currencyCode?: string
  inStockOnly?: boolean
  exactMatch?: boolean
  isCrawler?: boolean
  useCachedData?: boolean
  signal?: AbortSignal
}

export type TrustedPartsInventoryClientOptions = {
  companyId: string
  apiKey: string
  /** An internal application identifier or the actual visitor's user agent. */
  userAgent: string
  platformFetch?: PlatformFetch
  endpoint?: string
  timeoutMs?: number
  /**
   * Allowed only for approved internal purchasing or with written ECIA consent.
   * Never enable this for an unapproved public-facing service.
   */
  cache?: {
    explicitlyAuthorized: true
    ttlMs: number
    maxEntries?: number
  }
}

type CacheEntry = { expiresAt: number; result: unknown }

/**
 * Server-only transport for TrustedParts Inventory API v2.
 * No response cache by default. Never publish supplier credentials or
 * republish supplier data without appropriate authorization.
 */
export class TrustedPartsInventoryClient {
  private readonly options: TrustedPartsInventoryClientOptions
  private readonly endpoint: string
  private readonly cache = new Map<string, CacheEntry>()
  private readonly evictionTimers = new Map<
    string,
    ReturnType<typeof setTimeout>
  >()
  private readonly pending = new Map<string, Promise<unknown>>()

  constructor(options: TrustedPartsInventoryClientOptions) {
    if ("window" in globalThis) {
      throw new Error("TrustedParts credentials are for server use only")
    }
    if (
      !options.companyId.trim() ||
      !options.apiKey.trim() ||
      !options.userAgent.trim()
    ) {
      throw new Error(
        "TrustedParts companyId, apiKey and userAgent are required",
      )
    }
    const endpoint = new URL(options.endpoint ?? DEFAULT_ENDPOINT)
    if (endpoint.protocol !== "https:") {
      throw new Error("TrustedParts endpoint must use HTTPS")
    }
    if (
      options.timeoutMs !== undefined &&
      (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
    ) {
      throw new Error("TrustedParts timeoutMs must be positive")
    }
    const policy = options.cache
    if (
      policy &&
      (policy.explicitlyAuthorized !== true ||
        !Number.isFinite(policy.ttlMs) ||
        policy.ttlMs <= 0 ||
        policy.ttlMs > ONE_WEEK_MS ||
        (policy.maxEntries !== undefined &&
          (!Number.isInteger(policy.maxEntries) || policy.maxEntries <= 0)))
    ) {
      throw new Error(
        "TrustedParts caching requires authorization, a <=7-day TTL and positive size",
      )
    }
    this.options = options
    this.endpoint = endpoint.toString()
  }

  clearCache(): void {
    for (const timer of this.evictionTimers.values()) clearTimeout(timer)
    this.evictionTimers.clear()
    this.cache.clear()
  }

  private discardCacheEntry(key: string): void {
    const timer = this.evictionTimers.get(key)
    if (timer) clearTimeout(timer)
    this.evictionTimers.delete(key)
    this.cache.delete(key)
  }

  async search(request: TrustedPartsSearchRequest): Promise<unknown> {
    if (
      !Array.isArray(request.queries) ||
      request.queries.length === 0 ||
      request.queries.length > 50
    ) {
      throw new Error("TrustedParts searches must contain 1 to 50 part numbers")
    }
    for (const query of request.queries) {
      if (
        typeof query.searchToken !== "string" ||
        query.searchToken.trim().length < 2
      ) {
        throw new Error(
          "TrustedParts SearchToken must be at least two characters",
        )
      }
    }
    if (request.countryCode && !/^[a-zA-Z]{2}$/.test(request.countryCode)) {
      throw new Error("TrustedParts countryCode must contain two letters")
    }
    if (request.currencyCode && !/^[a-zA-Z]{3}$/.test(request.currencyCode)) {
      throw new Error("TrustedParts currencyCode must contain three letters")
    }
    const payload = {
      Queries: request.queries.map((query) => ({
        SearchToken: query.searchToken,
        ...(query.manufacturers ? { Manufacturers: query.manufacturers } : {}),
      })),
      InStockOnly: request.inStockOnly ?? false,
      ExactMatch: request.exactMatch ?? true,
      IsCrawler: request.isCrawler ?? false,
      UseCachedData: request.useCachedData ?? true,
      UserAgent: request.userAgent ?? this.options.userAgent,
      ...(request.sourceIp ? { SourceIp: request.sourceIp } : {}),
      ...(request.countryCode ? { CountryCode: request.countryCode } : {}),
      ...(request.currencyCode ? { CurrencyCode: request.currencyCode } : {}),
    }
    // Client instances hold a single supplier account. Keys never include secrets.
    const key = JSON.stringify(payload)
    const cached = this.cache.get(key)
    if (cached) {
      if (cached.expiresAt > Date.now()) return structuredClone(cached.result)
      this.discardCacheEntry(key)
    }

    // Requests with per-caller abort signals cannot safely share the same fetch.
    if (!request.signal) {
      const shared = this.pending.get(key)
      if (shared) return shared
    }
    const timeout = AbortSignal.timeout(this.options.timeoutMs ?? 10_000)
    const signal = request.signal
      ? AbortSignal.any([timeout, request.signal])
      : timeout
    const work = (async (): Promise<unknown> => {
      const response = await (this.options.platformFetch ?? fetch)(
        this.endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal,
          body: JSON.stringify({
            CompanyId: this.options.companyId,
            ApiKey: this.options.apiKey,
            ...payload,
          }),
        },
      )
      if (!response.ok) {
        // Do not echo potentially sensitive response bodies or authentication.
        throw new Error(
          "TrustedParts request failed (HTTP " + response.status + ")",
        )
      }
      const result: unknown = await response.json()
      const policy = this.options.cache
      if (policy) {
        const limit = policy.maxEntries ?? 100
        while (this.cache.size >= limit) {
          const first = this.cache.keys().next().value
          if (!first) break
          this.discardCacheEntry(first)
        }
        this.discardCacheEntry(key)
        this.cache.set(key, {
          expiresAt: Date.now() + policy.ttlMs,
          result: structuredClone(result),
        })
        const timer = setTimeout(
          () => this.discardCacheEntry(key),
          policy.ttlMs,
        )
        timer.unref?.()
        this.evictionTimers.set(key, timer)
      }
      return result
    })()
    if (!request.signal) this.pending.set(key, work)
    try {
      return await work
    } finally {
      if (this.pending.get(key) === work) this.pending.delete(key)
    }
  }
}
