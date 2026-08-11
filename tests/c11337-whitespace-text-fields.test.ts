import { expect, test } from "bun:test"
import { JlcPcbPartsEngine, type PlatformFetch } from "../lib/jlc-parts-engine"
import c11337RawEasyEdaJson from "./fixtures/C11337.raweasy.json"

const getRequestUrl = (request: Parameters<typeof fetch>[0]): string => {
  if (typeof request === "string") return request
  if (request instanceof URL) return request.href
  return request.url
}

const c11337FixtureFetch: PlatformFetch = async (request) => {
  const requestUrl = getRequestUrl(request)

  if (requestUrl === "https://easyeda.com/api/components/search") {
    return Response.json({
      success: true,
      result: {
        lists: {
          lcsc: [
            {
              uuid: c11337RawEasyEdaJson.uuid,
              dataStr: c11337RawEasyEdaJson.dataStr,
            },
          ],
        },
      },
    })
  }

  if (
    requestUrl.startsWith(
      `https://easyeda.com/api/components/${c11337RawEasyEdaJson.uuid}`,
    )
  ) {
    return Response.json({ success: true, result: c11337RawEasyEdaJson })
  }

  return new Response("Fixture does not provide this resource", {
    status: 404,
  })
}

test("fetchPartCircuitJson parses C11337 whitespace-only text fields", async () => {
  const engine = new JlcPcbPartsEngine({
    platformFetch: c11337FixtureFetch,
  })

  let conversionResult:
    | { status: "error"; message: string }
    | { status: "success"; elementTypeCounts: Record<string, number> }

  try {
    const circuitJson = await engine.fetchPartCircuitJson!({
      supplierPartNumber: "C11337",
    })
    if (!circuitJson) throw new Error("Expected C11337 Circuit JSON")

    conversionResult = {
      status: "success",
      elementTypeCounts: Object.fromEntries(
        Object.entries(
          circuitJson.reduce<Record<string, number>>((counts, element) => {
            counts[element.type] = (counts[element.type] ?? 0) + 1
            return counts
          }, {}),
        ).sort(([firstType], [secondType]) =>
          firstType.localeCompare(secondType),
        ),
      ),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    conversionResult = {
      status: "error",
      message: errorMessage.replace(/\s+/g, " ").trim(),
    }
  }

  expect(conversionResult).toMatchInlineSnapshot(`
    {
      "message": "[ { "received": " ", "code": "invalid_enum_value", "options": [ "normal", "italic" ], "path": [ "fontStyle" ], "message": "Invalid enum value. Expected 'normal' | 'italic', received ' '" } ]",
      "status": "error",
    }
  `)
})
