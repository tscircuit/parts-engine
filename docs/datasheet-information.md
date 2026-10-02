# Datasheet lookup and footprint reconciliation

Supplier engines find supplier parts and import supplier Circuit JSON. They do
not know about api.tscircuit.com, registry options, or datasheet HTTP requests.
The default registry provider is a separate exported function:

```ts
import {
  JlcPcbPartsEngine,
  fetchDatasheetInformation,
  reconcileDatasheetCircuitJson,
} from "@tscircuit/parts-engine"

const supplier = new JlcPcbPartsEngine()
const circuitJson = await supplier.fetchPartCircuitJson({ supplierPartNumber: "C460327" })
const datasheet = await fetchDatasheetInformation({ manufacturerPartNumber: "AP2127K-2.8TRG1" })
if (circuitJson && datasheet) {
  const result = reconcileDatasheetCircuitJson({
    circuitJson,
    datasheetCircuitJson: datasheet.circuitJson,
    attributePriority: "existing",
  })
  // result.circuitJson keeps the footprint's IDs, names, geometry and connectivity.
  // Use the match diagnostics to build one warning for this component.
}
```

`DatasheetInformation.circuitJson` contains one `source_component` with a
manufacturer part number and canonical `source_port` records with snake_case
attributes. Registry camelCase pin maps are validated against the exact
`@tscircuit/props` schema and converted at this boundary. There is no second
camelCase electrical map in the public result. PDF URLs, the footprinter string,
generated TSX, and registry identifiers remain in the metadata envelope. Stored
TSX is never evaluated and read requests never trigger extraction.

Each manufacturer physical pin has a `pinN` or `pinA1` source-port identity.
BGA ball labels remain in names/hints, without coercing them to numeric pins.
Physical pins with no known electrical attributes remain represented, so
coverage checks can distinguish an empty pin from an absent pin. Label-keyed
attributes are separate source ports and can apply to several physical pins.
Descriptions and operating-condition detail remain in the API's pin framework;
the Circuit JSON projection carries structured electrical attributes only.

## Explicit reconciliation

`reconcileDatasheetCircuitJson` is exported and pure. It accepts two Circuit JSON
arrays, an optional `sourceComponentId` target, and `attributePriority`.
A multi-component target requires an explicit component ID. A different known
manufacturer part number rejects before attributes are applied.

Matching uses physical numbers, canonical ball names and imported hints. For
supplier ports numbered numerically, a BGA ball hint can identify the matching
manufacturer contact. Imported signal labels take precedence over fallback
labels from manufacturer rows; physical entries override label attributes.
This preserves the F1C board's SK9822-A signal roles despite alternate numbering.
Shared label attributes apply to each matching pin. Conflicting labels or
multiple candidate physical pins are reported instead of guessed.

The result contains `matchedSourcePortIds`, `unmatchedSourcePortIds`,
`missingAttributeSourcePortIds`, `unmatchedDatasheetSourcePortIds`, and
`ambiguousMatches` with target/candidate source-port IDs. An empty matched pin
still appears in `missingAttributeSourcePortIds`. Unmatched/ambiguous pins remain
unchanged. No geometry, IDs, port names or connectivity are replaced or appended.

`attributePriority: "datasheet"` is the default: known datasheet fields replace
corresponding importer fields while omitted fields preserve existing attributes.
Core can choose `"existing"` to retain explicitly configured attributes while
filling missing fields. False and zero are meaningful and are preserved.

## Composition

Core can depend on the optional `PartsEngine.fetchDatasheetInformation` contract
in the companion props PR. Its standard result carries Circuit JSON and optional
metadata; existing engines need not implement the method. The registry provider
is replaceable without modifying supplier engines:

```ts
import {
  JlcPcbPartsEngine,
  createDatasheetInformationLoader,
  withDatasheetInformation,
} from "@tscircuit/parts-engine"

const engine = withDatasheetInformation(new JlcPcbPartsEngine(), {
  fetchDatasheetInformation: createDatasheetInformationLoader({
    datasheetApiBaseUrl: "https://api.tscircuit.com",
  }),
})
const datasheet = await engine.fetchDatasheetInformation({ manufacturerPartNumber: "F1C100S" })
```

The same adapter supports DigiKey, Mouser, or a custom engine/provider. It binds
supplier methods to preserve their context and keeps unsupported supplier
methods absent. Explicit datasheet calls always request the record; no enable
flag is required for a deliberate call.

Optional convenience enrichment remains on the adapter's `fetchPartCircuitJson`
via `includeDatasheetInformation: true` (adapter default or per-call
option). It uses supplier-reported manufacturer identity, rejects a requested
voltage-variant mismatch before contacting the registry, and calls the same pure
reconciliation function. The supplier engine itself receives no datasheet flags.
For match diagnostics and Core warnings, use the explicit lookup/reconciliation
path rather than the convenience array-only result.

## Registry transport and caching

`createDatasheetInformationLoader` configures an endpoint and default
`platformFetch`. Per-call fetch overrides have isolated caches. The exported
`fetchDatasheetInformation` uses a shared default provider; custom factory
instances have their own bounded caches. Supplier proxies never affect registry
requests.

404 means no record. HTTP, transport, schema, mismatched-chip and timeout errors
reject, so Core can distinguish failures from unavailable attributes. A real
five-second deadline covers response headers and the JSON body, including custom
fetch/body readers that ignore abort signals. Its error explains that pin
attributes may not be populated.

Concurrent identical requests share a promise. Successful reads are cached for
at most 60 seconds, honoring shorter Cache-Control max-age, Age, no-cache and
no-store. Misses/failures are retried; at most 256 entries are retained per
provider/fetch implementation. Returned Circuit JSON is cloned so consumer edits
cannot change the cache.

## Core rollout

1. Use the shared optional method to fetch datasheet Circuit JSON independently
   of footprint import, then call explicit reconciliation on the rendered
   component's source ports. No JLC lookup is required for a manually supplied
   footprint. Reuse already fetched supplier geometry when available.
2. Choose existing-attribute precedence for explicit user settings without
   mutating parsed props. Apply reconciliation before source electrical checks.
3. Combine missing, empty and ambiguous-pin diagnostics into one warning per
   chip after lookup settles; distinguish lookup failures and respect DRC and
   parts-engine disable controls.
4. Add the 1.8V regulator/2.8V requirement regression and the passing 2.8V case.
   Core warning orchestration and voltage-compatibility checks remain follow-ups.

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
