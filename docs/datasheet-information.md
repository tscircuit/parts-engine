# Datasheet attributes in Circuit JSON

Request electrical attributes through the existing Circuit JSON method:

```ts
import { JlcPcbPartsEngine } from "@tscircuit/parts-engine"

const engine = new JlcPcbPartsEngine()
const circuitJson = await engine.fetchPartCircuitJson({
  supplierPartNumber: "C11337",
  includeDatasheetInformation: true,
})
// source_port records include provides_voltage, requires_voltage,
// requires_power, provides_power, do_not_connect, supports_i2c_sda, etc.
```

The option can also be set on the constructor. A per-call true/false overrides
that default. With enrichment disabled (the default), no datasheet request is
made and existing Circuit JSON behavior is unchanged.

The engine reads the exact manufacturer part number from the imported EasyEDA
record, or uses the supplied manufacturer number when the record lacks one.
When enrichment is enabled, manufacturer searches require an exact catalog
match; a fuzzy voltage variant is not accepted. If the requested manufacturer
number disagrees with the imported record, the call rejects before loading
attributes for the wrong part.

Stored attributes are mapped onto existing `source_port` records by physical
pin number (`pin1`, `pin2`, etc.) or label, following the unmodified
`@tscircuit/props` pinAttributes schema. Label keys resolve against the port's
name/hints and the matching datasheet pin_information names; shared labels apply
to each matching pin. Physical pin entries override label entries field by field.
Canonical names (`pinA1`) also work when there is no numeric pin_number. Only ports belonging to the imported source component
are enriched. Geometry, IDs, names, and pin counts are preserved. Supplied
attributes replace corresponding importer values; omitted attributes preserve
existing values. Explicit false and zero values are retained. The source
component also carries the datasheet's manufacturer part number.

API `pin_attributes` and returned `pinAttributes` use the props schema's camelCase
attribute names and upstream unknown-field stripping. Snake_case conversion
happens only when emitting canonical Circuit JSON source_port fields.

Mapping follows core's `applyPinAttributesToSourcePort` and the existing
Circuit JSON `SourcePinAttributes` schema. Capabilities become `supports_*`
and active capabilities become `is_configured_for_*`. TSX-only attributes
without a corresponding Circuit JSON field (such as highlightColor and isGpio)
are not invented as new JSON properties. They remain accessible through the
raw metadata method below.

The loader performs `GET https://api.tscircuit.com/datasheets/get?chip_name=...`.
Set `datasheetApiBaseUrl` for another registry. Constructor and per-call
`platformFetch` overrides apply; datasheet requests bypass the EasyEDA proxy.
Reads do not trigger AI extraction or evaluate generated TSX.

A missing datasheet (404) leaves the original Circuit JSON intact. Transport,
non-404 HTTP, invalid schema, and wrong-chip responses reject so callers can
distinguish unavailable information from a missing record. Requests carry a
10-second abort signal. Concurrent identical lookups share a promise. Successes
are cached for at most 60 seconds, honoring shorter max-age, Age, no-cache and
no-store. Failures/404s are not retained. Caches hold at most 256 entries per
engine and fetch implementation; caller edits do not mutate cached metadata.

## Additional metadata

`fetchDatasheetInformation({ manufacturerPartNumber })` remains available on
JLCPCB, DigiKey, and Mouser engines with the same opt-in option. It returns
`datasheetId`, `chipName`, `datasheetPdfUrls`, `pinInformation`, `pinAttributes`,
`footprinterString`, and `generatedTsx`. This supports consumers needing TSX or
other metadata that has no existing Circuit JSON representation. DigiKey and
Mouser do not currently implement `fetchPartCircuitJson`.

## Revised core rollout

1. Add `includeDatasheetInformation?: boolean` to the existing
   `PartsEngine.fetchPartCircuitJson` parameter contract in `@tscircuit/props`.
   No new loader method is required for core's electrical-check path.
2. Have core request enriched Circuit JSON before source electrical checks and
   transfer the matching source_port attributes into its resolved component
   attributes. Reuse existing fetched part data where possible; preserve explicit
   user overrides without mutating props.
3. Emit one aggregated missing-attributes warning per chip after the lookup
   settles, with affected pins and applicable missing fields. Distinguish failed
   lookups from missing data and respect parts-engine/DRC disable controls.
4. Add the 1.8 V supply / 2.8 V requirement regression using the enriched
   source_port records, plus the passing 2.8 V case. Core integration and the
   electrical mismatch check remain follow-up work.

This updates the transport choice in the API PR's rollout plan: electrical
metadata travels in Circuit JSON rather than requiring a separate core lookup.
