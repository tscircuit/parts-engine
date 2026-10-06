import type {
  FetchPartAvailabilityParams,
  PartAvailability,
} from "@tscircuit/props"
import { z } from "zod"

const jlcSearchResponse = z.object({
  components: z.array(
    z.object({
      lcsc: z.union([z.string(), z.number()]),
      stock: z.number().finite().nonnegative().nullable().optional(),
      price: z.unknown().optional(),
      price1: z.unknown().optional(),
    }),
  ),
})

const parseNonNegativeNumber = (quote: unknown): number | null => {
  if (typeof quote !== "number" && typeof quote !== "string") return null
  if (typeof quote === "string" && !quote.trim()) return null
  const amount = Number(quote)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

const parseUnitPrice = (quote: unknown): number | null => {
  const amount = parseNonNegativeNumber(quote)
  if (amount !== null) return amount
  if (typeof quote !== "string") return null
  try {
    const tiers = z
      .array(
        z.object({
          price: z.number().finite().nonnegative(),
          qFrom: z.number().optional(),
        }),
      )
      .safeParse(JSON.parse(quote))
    if (tiers.success) {
      return (
        tiers.data.sort((a, b) => (a.qFrom ?? 1) - (b.qFrom ?? 1))[0]?.price ??
        null
      )
    }
  } catch {
    const tiers = quote
      .split(",")
      .map((tier) => {
        const [quantity, price] = tier.split(":")
        return {
          quantity: parseNonNegativeNumber(quantity?.split("-")[0]),
          price: parseNonNegativeNumber(price),
        }
      })
      .filter((tier) => tier.quantity !== null && tier.price !== null)
      .sort((a, b) => a.quantity! - b.quantity!)
    return tiers[0]?.price ?? null
  }
  return null
}

const normalizeJlcPartNumber = (supplierPartNumber: string): string | null => {
  const normalized = supplierPartNumber.trim().toUpperCase()
  if (!/^C?\d+$/.test(normalized)) return null
  const lcsc = Number(normalized.replace(/^C/, ""))
  return Number.isSafeInteger(lcsc) && lcsc > 0 ? `C${lcsc}` : null
}

export const fetchJlcPartAvailability = async ({
  supplierName,
  supplierPartNumber,
  platformFetch = globalThis.fetch,
  signal,
}: FetchPartAvailabilityParams): Promise<PartAvailability | undefined> => {
  if (supplierName !== "jlcpcb") return undefined
  const checkedAt = new Date().toISOString()
  const unknownAvailability: PartAvailability = {
    stock: null,
    price: null,
    currency: null,
    checkedAt,
  }
  const partNumber = normalizeJlcPartNumber(supplierPartNumber)
  if (!partNumber) return unknownAvailability
  const timeoutSignal = AbortSignal.timeout(10_000)
  const requestOptions: Parameters<
    NonNullable<FetchPartAvailabilityParams["platformFetch"]>
  >[1] & { cache: "no-store" } = {
    cache: "no-store",
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  }
  const response = await platformFetch(
    `https://jlcsearch.tscircuit.com/api/search?q=${encodeURIComponent(partNumber)}&limit=1`,
    requestOptions,
  )
  if (!response.ok) throw new Error("JLC availability lookup failed")
  const catalog = jlcSearchResponse.safeParse(await response.json())
  if (!catalog.success) return unknownAvailability
  const supplierPart = catalog.data.components.find(
    (part) => normalizeJlcPartNumber(String(part.lcsc)) === partNumber,
  )
  if (!supplierPart) return unknownAvailability
  const price =
    parseNonNegativeNumber(supplierPart.price1) ??
    parseUnitPrice(supplierPart.price)
  return {
    stock: supplierPart.stock ?? null,
    price,
    currency: price === null ? null : "USD",
    checkedAt,
  }
}
