# parts-engine

The tscircuit platform parts engine.

## Supplier engines

`jlcPartsEngine.fetchPartAvailability({ supplierName: "jlcpcb", supplierPartNumber: "C1525" })`
returns `{ stock, price, currency, checkedAt }`. Stock is the available unit count;
price is the per-unit quote at the lowest quantity tier, in the stated ISO currency
(USD for JLCPCB). Unknown stock and price are `null`. The timestamp records when
the lookup ran; jlcsearch may cache its supplier data.

The method accepts optional `platformFetch` and `signal` overrides, bypasses the
part-selection cache, and limits requests to 10 seconds. Unsupported suppliers
return `undefined` without a request; HTTP and network failures reject so callers
can distinguish failed lookups. Availability remains optional on `PartsEngine`,
so existing engines need no changes.

```ts
import {
  digikeyPartsEngine,
  jlcPartsEngine,
  DigiKeyPartsEngine,
  mouserPartsEngine,
  MouserPartsEngine,
} from "@tscircuit/parts-engine"
```

`digikeyPartsEngine.findPart(...)` queries
`https://digikeysearch.tscircuit.com`, which provides the same category route
shape as jlcsearch while caching DigiKey Product Information V4 calls. Use
`new DigiKeyPartsEngine({ platformFetch, apiBaseUrl })` to inject a platform
fetch implementation or a test/self-hosted endpoint.

`mouserPartsEngine.findPart(...)` queries
`https://mousersearch.tscircuit.com`, which exposes the same category route
shape while caching Mouser Search API calls. Use
`new MouserPartsEngine({ platformFetch, apiBaseUrl })` to inject a platform
fetch implementation or a test/self-hosted endpoint.
