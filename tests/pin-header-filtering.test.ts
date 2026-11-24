import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import type { AnySourceComponent } from "circuit-json"
import { cache, jlcPartsEngine } from "../lib/jlc-parts-engine"
import {
  filterPinHeaderParts,
  getPinHeaderSearchParams,
  isSmdPinHeaderPart,
} from "../lib/jlc-parts-engine/get-pin-header-search-params"

const originalFetch = globalThis.fetch

const CATALOG_ROWS = [
  {
    lcsc: 5242195,
    package: "SMD,P=2.54mm,Surface Mount, Right Angle",
    mounting_style: "Surface Mount",
    description: "2P 2.54mm Surface Mount Right Angle Pin Header",
    is_right_angle: true,
    is_basic: true,
  },
  {
    lcsc: 780060,
    package: "SMD,P=2.54mm(交错脚)",
    mounting_style: null,
    description: "1x2P 2.54mm 2P 3A Black Brass Gold",
    is_right_angle: false,
    is_basic: false,
  },
  {
    lcsc: 3320166,
    package: "P=2.54mm",
    mounting_style: "Surface Mount,Vertical",
    description: "1x2P 2.54mm Female Header",
    is_right_angle: false,
    is_basic: false,
  },
  {
    lcsc: 32713261,
    package: "弯插,P=2.54mm",
    mounting_style: "Bend insert",
    description: "1x2P 2.54mm Right Angle Through Hole",
    is_right_angle: true,
    is_basic: false,
  },
  {
    lcsc: 5383111,
    package: "插件,P=2.54mm",
    mounting_style: "Direct Insert",
    description: "1x2P 2.54mm Straight Pin Header",
    is_right_angle: false,
    is_basic: false,
  },
] as const

describe("pin header orientation and mounting filters", () => {
  beforeEach(() => {
    cache.clear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("defaults is_right_angle=false for straight pinrow footprints", () => {
    const params = getPinHeaderSearchParams(
      {
        type: "source_component",
        ftype: "simple_pin_header",
        pin_count: 2,
        gender: "male",
      },
      "pinrow2_p2.54_nopinlabels",
    )
    expect(params).toEqual({
      pitch: 2.54,
      num_pins: 2,
      gender: "male",
      is_right_angle: false,
    })

    const explicitRightAngle = getPinHeaderSearchParams(
      {
        type: "source_component",
        ftype: "simple_pin_header",
        pin_count: 2,
        gender: "male",
        rightAngle: true,
      },
      "pinrow2_p2.54_nopinlabels",
    )
    expect(explicitRightAngle.is_right_angle).toBe(true)

    const nonPinrow = getPinHeaderSearchParams(
      {
        type: "source_component",
        ftype: "simple_pin_header",
        pin_count: 8,
        gender: "male",
      },
      "2x4_p2.54",
    )
    expect(nonPinrow.is_right_angle).toBeUndefined()
  })

  test("identifies SMD headers across package, mounting_style and description", () => {
    expect(isSmdPinHeaderPart(CATALOG_ROWS[0])).toBe(true)
    expect(isSmdPinHeaderPart(CATALOG_ROWS[1])).toBe(true)
    expect(isSmdPinHeaderPart(CATALOG_ROWS[2])).toBe(true)
    expect(isSmdPinHeaderPart(CATALOG_ROWS[3])).toBe(false)
    expect(isSmdPinHeaderPart(CATALOG_ROWS[4])).toBe(false)
  })

  test("excludes SMD and right-angle headers for straight through-hole pinrow footprints", async () => {
    const fetchedUrls: string[] = []
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetchedUrls.push(url)
      return {
        json: async () => ({ headers: [...CATALOG_ROWS] }),
      } as Response
    }) as typeof fetch

    const header: AnySourceComponent = {
      type: "source_component",
      ftype: "simple_pin_header",
      pin_count: 2,
      gender: "male",
      source_component_id: "source_component_0",
      name: "J1",
    }

    const result = await jlcPartsEngine.findPart({
      sourceComponent: header,
      footprinterString: "pinrow2_p2.54_nopinlabels",
    })

    expect(result).toEqual({ jlcpcb: ["C5383111"] })
    const firstUrl = fetchedUrls[0]
    if (!firstUrl) throw new Error("Expected a fetched URL")
    const parsedUrl = new URL(firstUrl)
    expect(parsedUrl.pathname).toBe("/headers/list")
    expect(parsedUrl.searchParams.get("is_right_angle")).toBe("false")
  })

  test("selects right-angle through-hole header when rightAngle is true and preserves SMD when _smd footprint is requested", () => {
    const rightAngle = filterPinHeaderParts(
      [...CATALOG_ROWS],
      { ftype: "simple_pin_header", rightAngle: true },
      "pinrow2_p2.54_nopinlabels",
    )
    expect(rightAngle.map((h) => h.lcsc)).toEqual([32713261])

    const smdStraight = filterPinHeaderParts(
      [...CATALOG_ROWS],
      { ftype: "simple_pin_header", rightAngle: false },
      "pinrow2_p2.54_smd",
    )
    expect(smdStraight.map((h) => h.lcsc)).toEqual([780060, 3320166, 5383111])
  })
})
