const FOOTPRINTER_TO_JLC_PACKAGE: Record<string, string> = {
  // SOT packages
  sot23: "SOT-23",
  sot23_3: "SOT-23",
  sot23_3p: "SOT-23",
  sot23_5: "SOT-23-5",
  sot23_5p: "SOT-23-5",
  sot23_6: "SOT-23-6",
  sot23_6p: "SOT-23-6",
  sot223: "SOT-223",
  sot89: "SOT-89",
  sot323: "SOT-323",
  sot363: "SOT-363",
  // SOD packages
  sod123: "SOD-123",
  sod123fl: "SOD-123FL",
  sod323: "SOD-323",
  sod523: "SOD-523",
  // Diode DO-214 packages
  sma: "SMA(DO-214AC)",
  smb: "SMB(DO-214AA)",
  smc: "SMC(DO-214AB)",
  // TO power/transistor packages
  to252: "TO-252-2(DPAK)",
  dpak: "TO-252-2(DPAK)",
  to263: "TO-263-2(D2PAK)",
  d2pak: "TO-263-2(D2PAK)",
  to220: "TO-220",
  to92: "TO-92",
  // Common IC packages
  soic8: "SOIC-8",
  soic14: "SOIC-14",
  soic16: "SOIC-16",
  tssop8: "TSSOP-8",
  tssop14: "TSSOP-14",
  tssop16: "TSSOP-16",
  tssop20: "TSSOP-20",
  msop8: "MSOP-8",
  ssop8: "SSOP-8",
}

/**
 * Transforms a generic "footprinter string" into a JLC-compatible package name.
 * e.g. "cap0603" -> "0603", "sot23" -> "SOT-23", "sma" -> "SMA(DO-214AC)"
 */
export const getJlcPackageFromFootprinterString = (
  footprinterString: string,
): string => {
  const trimmed = footprinterString.trim()
  if (trimmed.includes("cap")) {
    return trimmed.replace(/cap/g, "")
  }

  // Normalize lowercase base key (strip optional footprinter parameter suffixes like _p1.27mm)
  const lower = trimmed.toLowerCase()
  if (FOOTPRINTER_TO_JLC_PACKAGE[lower]) {
    return FOOTPRINTER_TO_JLC_PACKAGE[lower]
  }

  // Handle hyphenated/underscored variants like "sot-23" or "sot_23"
  const compact = lower.replace(/[-_]/g, "")
  if (FOOTPRINTER_TO_JLC_PACKAGE[compact]) {
    return FOOTPRINTER_TO_JLC_PACKAGE[compact]
  }

  return trimmed
}
