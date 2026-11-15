import type { PcbPin1Location } from "circuit-json"

/** Pin 1 at 0° in JLCPCB's top-side assembly preview. */
export const jlcpcbAssemblyPin1Locations = new Map<string, PcbPin1Location>([
  // TPS26632RGER, verified from JLCPCB's NEMA 23 v1.4.26 assembly review.
  ["C1850278", "bottomside_left"],
])
