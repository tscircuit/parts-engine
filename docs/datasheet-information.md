# Datasheet attributes in imported Circuit JSON

Opt in to datasheet enrichment directly on the JLC parts engine:

```ts
import { JlcPcbPartsEngine } from "@tscircuit/parts-engine"

const engine = new JlcPcbPartsEngine()
const circuitJson = await engine.fetchPartCircuitJson({
  supplierPartNumber: "C460327",
  includeDatasheetInformation: true,
})
// The regulator's output source_port includes provides_voltage and provides_power.
```

`includeDatasheetInformation` defaults to false. A constructor default can enable
it for every import; a per-call option overrides that default. The result is the
ordinary Circuit JSON array, with electrical attributes on its existing source
ports. No adapter or shared props interface change is required.

The supplier class orchestrates import and enrichment. Focused modules handle
registry HTTP/schema/caching, conversion to Circuit JSON, and pure pin matching.
Enrichment uses supplier-reported manufacturer identity; a different requested
part number rejects before contacting the registry. Manufacturer searches require
an exact match when enrichment is enabled, preventing a fuzzy search from
substituting a different voltage variant.

## Pin matching and attributes

Registry pin maps are validated against the existing `@tscircuit/props` schema
and converted to canonical Circuit JSON snake_case attributes. These validators
are bundled from development dependencies; no runtime dependencies are added.
Stored TSX is never evaluated and reads never trigger extraction.

Physical pins use numbers or canonical `pinA1` ball names/hints. BGA labels are
not coerced to numeric pins. Imported signal labels take precedence over fallback
labels from manufacturer rows; physical entries override label attributes.
Shared label attributes can apply to several pins. Conflicting labels or multiple
physical candidates remain unchanged instead of guessing a role. Geometry, IDs,
port names and connectivity are preserved. Known datasheet fields replace importer
fields, while omitted fields preserve existing attributes. False and zero remain
meaningful.

`reconcileDatasheetCircuitJson` is also exported for callers that already have
both arrays. It accepts `sourceComponentId` for multi-component circuits and
`attributePriority: "existing"` to preserve explicit attributes. Its result
includes matched, unmatched, empty, and ambiguous source-port IDs for coverage
checks. A known manufacturer identity mismatch rejects.

Standalone `fetchDatasheetInformation` and `createDatasheetInformationLoader`
remain available when only a registry record is needed. Their standard result
contains datasheet Circuit JSON and optional PDF URLs, footprinter string and
TSX source text. Descriptions remain in the API's pin framework. Physical pins
without known electrical attributes stay represented in the datasheet array;
matching an empty pin does not imply complete attributes.

## Registry transport and caching

Constructor `datasheetApiBaseUrl` configures the registry endpoint. The engine's
`platformFetch` and per-call fetch overrides apply to registry requests directly,
without routing them through the EasyEDA proxy or forwarding its credentials.

404 means no record and preserves the imported circuit. Transport, HTTP, schema,
mismatched-chip and timeout errors reject. A real five-second deadline covers
response headers and JSON body readers, including custom transports that ignore
abort signals. The timeout error explains that pin attributes may not be populated;
callers can surface it as a warning.

Concurrent identical reads share a promise. Successful reads are cached for at
most 60 seconds, honoring shorter Cache-Control max-age, Age, no-cache and no-store.
Caches are isolated per loader/fetch implementation and bounded to 256 entries.
Misses and failures are retried. Returned Circuit JSON is cloned so consumer edits
cannot change the cache.

## Core follow-up

Core can consume the enriched Circuit JSON before electrical checks, preserve
explicit user attributes, and aggregate missing attributes into one warning per
chip. Warning orchestration and voltage compatibility checks remain follow-ups.
No additional method on the shared props PartsEngine interface is introduced here.

## Practical F1C100S verification

Production API records cover all 140 physical pins across the board's nine ICs:
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

The checks verify physical coverage and preservation of populated attributes,
not a core DRC warning. They report explicitly empty API maps separately rather
than inferring a role; the current F1C100S record leaves pin33 unspecified.
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
