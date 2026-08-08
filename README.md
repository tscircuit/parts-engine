# parts-engine

The tscircuit platform parts engine.

## Supplier engines

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
