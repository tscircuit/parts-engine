import { getFootprinterStringFromKicad } from "./get-footprinter-string-from-kicad"
import { getJlcPackageFromFootprinterString } from "./get-jlc-package-from-footprinter-string"

/**
 * Get a JLC-compatible package name from a footprint string, which could be
 * a KiCad footprint or a generic "footprinter string".
 */
export const getJlcpcbPackageName = (
  footprint: string | undefined,
): string | undefined => {
  if (!footprint) return undefined

  if (footprint.startsWith("kicad:")) {
    const footprinterString = getFootprinterStringFromKicad(footprint)
    if (footprinterString) {
      return getJlcPackageFromFootprinterString(footprinterString)
    }

    // Fallback for un-matched KiCad strings
    return footprint
  }

  // Not a KiCad string, assume it's a footprinter string
  return getJlcPackageFromFootprinterString(footprint)
}
