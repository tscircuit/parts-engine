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
name/hints; datasheet pin_information names are a fallback when no imported
label matches. This avoids mixing unrelated roles for imports with different
pin numbering (the published F1C board uses this for SK9822-A). Shared labels
apply to each matching pin. Physical pin entries override label entries field by field.
Canonical names (`pinA1`) also work when there is no numeric pin_number. Only ports belonging to the imported source component
are enriched. Geometry, IDs, names, and pin counts are preserved. Supplied
attributes replace corresponding importer values; omitted attributes preserve
existing values. Explicit false and zero values are retained. The source
component also carries the datasheet's manufacturer part number.

API `pin_attributes` and returned `pinAttributes` use the props schema's camelCase
attribute names and upstream unknown-field stripping. Snake_case conversion
happens only when emitting canonical Circuit JSON source_port fields.

All props pin attributes are mapped to Circuit JSON. Capabilities become
`supports_*` and active capabilities become `is_configured_for_*`; other
attributes use snake_case. Direction, GPIO, tri-state, open-collector/emitter,
and highlight color require the companion schema addition:
https://github.com/tscircuit/circuit-json/pull/850. Older Circuit JSON parsers
will strip those new fields until they upgrade.

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

## Practical F1C100S verification

Production API records now cover all 140 pins across the board's nine ICs:
F1C100S (89), AP2112M-3.3TRG1 (8), AP2112K-1.2TRG1 (5),
AP2112K-2.5TRG1 (5), AP2127K-2.8TRG1 (5), W25Q128JVSIQ (8),
74AHCT2G125DC,125 (8), USBLC6-2SC6 (6), and SK9822-A (6).
AP2112K-1.8TRG1 is also stored to keep the faulty voltage variant explicit.
Each record has manufacturer datasheet links and generated TSX; verified
footprinter strings are present where available. Passives, connectors, and
switches are outside this IC metadata audit.

Run `bun scripts/verify-f1c100s-datasheets.ts` for a read-only check against
production API data and live supplier imports. Offline regressions use captured
supplier data and uploaded API responses in `tests/fixtures/f1c100s`.

The checks verify data transport and completeness, not a core DRC warning.
AVCC pin80 requires nominal 2.8V; DDR pins30/31/32/34/36 require nominal 2.5V.
The old regulator provides 1.8V. Voltage ranges are documented in the records'
descriptions because props currently has only scalar voltage fields. In
particular, core nominal 1.1V does not mean the existing 1.2V rail is automatically
invalid; Allwinner specifies 1.0-1.2V. HPVCC and SVREF have no separately specified
nominal voltage, so only their documented role is encoded.

The F1C capabilities correct two pairs in the published board metadata:
PE0/PE1 I2C clock/data, and TPY1/TPY2 UART/SPI roles. No firmware-selected
function or pull state is assumed. SK9822-A uses label-keyed attributes to
support both manufacturer numbering and the published board's numbering.

Live cache checks verify the 60-second Cache-Control policy and ETag/304.
Cloudflare currently reports DYNAMIC, so these checks do not demonstrate an
edge-cache hit. The parts-engine's own bounded cache is covered separately.
