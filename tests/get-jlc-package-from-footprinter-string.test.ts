import { expect, test } from "bun:test"
import { getJlcPackageFromFootprinterString } from "../lib/footprint-translators/get-jlc-package-from-footprinter-string"

test("maps common non-passive footprinter strings to jlcsearch package names (#83)", () => {
  const cases: Array<[string, string]> = [
    ["sot23", "SOT-23"],
    ["sot23_3", "SOT-23"],
    ["sot23_5", "SOT-23-5"],
    ["sot23_6", "SOT-23-6"],
    ["sot223", "SOT-223"],
    ["to252", "TO-252-2(DPAK)"],
    ["sod123", "SOD-123"],
    ["sod323", "SOD-323"],
    ["sod523", "SOD-523"],
    ["sma", "SMA(DO-214AC)"],
    ["smb", "SMB(DO-214AA)"],
    ["smc", "SMC(DO-214AB)"],
    ["SOT23", "SOT-23"],
    ["sot_23", "SOT-23"],
  ]

  for (const [input, expected] of cases) {
    expect(getJlcPackageFromFootprinterString(input)).toBe(expected)
  }
})

test("preserves passive imperial sizes, cap stripping, and already-formatted JLC packages", () => {
  expect(getJlcPackageFromFootprinterString("cap0603")).toBe("0603")
  expect(getJlcPackageFromFootprinterString("0603")).toBe("0603")
  expect(getJlcPackageFromFootprinterString("0402")).toBe("0402")
  expect(getJlcPackageFromFootprinterString("SOT-23")).toBe("SOT-23")
  expect(getJlcPackageFromFootprinterString("SMA(DO-214AC)")).toBe(
    "SMA(DO-214AC)",
  )
})
