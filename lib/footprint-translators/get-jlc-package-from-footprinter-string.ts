/**
 * Transforms a generic "footprinter string" into a JLC-compatible package name.
 * e.g. "0603cap" -> "0603"
 */
export const getJlcPackageFromFootprinterString = (
  footprinterString: string,
): string => {
  if (footprinterString.includes("cap")) {
    return footprinterString.replace("cap", "")
  }
  return footprinterString
}
