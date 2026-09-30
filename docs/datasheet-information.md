# Stored datasheet information

Opt in to public, stored datasheet information on any supplied engine:

```ts
import { JlcPcbPartsEngine } from "@tscircuit/parts-engine"

const engine = new JlcPcbPartsEngine({ includeDatasheetInformation: true })
const information = await engine.fetchDatasheetInformation({
  manufacturerPartNumber: "EXAMPLE-2V8",
})
// information?.pinAttributes can be used as TSX pinAttributes.
```

`DigiKeyPartsEngine` and `MouserPartsEngine` expose the same method and option.
A lookup can override the constructor setting with
`includeDatasheetInformation: true` or `false`. The default is false and makes
no requests. `findPart` still returns supplier part numbers, and
`fetchPartCircuitJson` still returns Circuit JSON; neither gains hidden
network work or changes its return shape.

The loader performs `GET https://api.tscircuit.com/datasheets/get?chip_name=...`.
Set `datasheetApiBaseUrl` for another registry. Both the constructor's
`platformFetch` and a per-call override are supported; the datasheet request is
not routed through the EasyEDA proxy. This endpoint only reads stored data and
does not trigger extraction, inference or component generation.

Returned fields are `datasheetId`, `chipName`, `datasheetPdfUrls`,
`pinInformation`, `pinAttributes`, `footprinterString`, and `generatedTsx`.
Physical pin keys (`pin1`, `pinA1`, etc.) identify `pinAttributes` entries. Values
use the existing `@tscircuit/props` schema, including unit strings or numbers in
volts for `requiresVoltage` / `providesVoltage`. Missing optional fields and
nulls are preserved. TSX is returned as source text and never evaluated.

A 404 or disabled lookup returns undefined. Network, non-404 HTTP, invalid
schema, and wrong-chip responses reject so callers can distinguish unavailable
information from a missing datasheet. Requests carry a 10-second abort signal.
Only a normalized exact manufacturer number is queried; there is no fuzzy or
supplier-number fallback that could select a different voltage variant.

Concurrent identical lookups share a promise. Successful responses are cached
for at most 60 seconds, honoring shorter HTTP max-age, Age, no-cache and no-store.
404s and failures are not retained. Caches hold at most 256 entries per engine
and fetch implementation, and returned data is cloned to isolate caller edits.

Core integration should add this optional method to `PartsEngine` in
`@tscircuit/props`, load before source electrical checks, merge supplied pin
attributes with explicit user values taking precedence, and report unresolved
pins/required electrical fields in one warning per chip. Until that integration
lands, applications explicitly call this method; enabling the constructor option
alone does not cause core to invoke it.
