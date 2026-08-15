import { expect, test } from "bun:test"
import { getJstConnectorSearchConfig } from "../lib/jlc-parts-engine/get-jst-connector-search-config"

test("maps JST standards to their pitches and catalog reference series", () => {
  expect(getJstConnectorSearchConfig("jst_sh")).toEqual({
    pitchMm: 1,
    compatibleReferenceSeries: ["SH", "SR/SZ"],
  })
  expect(getJstConnectorSearchConfig("jst_gh")).toEqual({
    pitchMm: 1.25,
    compatibleReferenceSeries: ["GH"],
  })
  expect(getJstConnectorSearchConfig("jst_zh")).toEqual({
    pitchMm: 1.5,
    compatibleReferenceSeries: ["ZH"],
  })
  expect(getJstConnectorSearchConfig("jst_ph")).toEqual({
    pitchMm: 2,
    compatibleReferenceSeries: ["PH"],
  })
  expect(getJstConnectorSearchConfig("jst_xh")).toEqual({
    pitchMm: 2.5,
    compatibleReferenceSeries: ["XH"],
  })
  expect(getJstConnectorSearchConfig("jst_vh")).toEqual({
    pitchMm: 3.96,
    compatibleReferenceSeries: ["VH"],
  })
  expect(getJstConnectorSearchConfig("usb_c")).toBeUndefined()
})
