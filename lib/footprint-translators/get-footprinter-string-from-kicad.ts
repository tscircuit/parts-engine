/**
 * Transforms a KiCad footprint string into a generic "footprinter string".
 * For now, this is a simplified conversion to a standard package name.
 * e.g. "kicad:Resistor_SMD:R_0603_1608Metric" -> "0603"
 */
export const getFootprinterStringFromKicad = (
  kicadFootprint: string,
): string | undefined => {
  // kicad:Resistor_SMD:R_0603_1608Metric -> 0603
  let match = kicadFootprint.match(/:[RC]_(\d{4})_/)
  if (match) return match[1]

  // kicad:Package_SO:SOIC-8_3.9x4.9mm_P1.27mm -> SOIC-8
  // kicad:Package_TO_SOT_SMD:SOT-23 -> SOT-23
  match = kicadFootprint.match(
    /:(SOIC-\d+|SOT-\d+|SOD-\d+|SSOP-\d+|TSSOP-\d+|QFP-\d+|QFN-\d+)/,
  )
  if (match) return match[1]

  return undefined
}
