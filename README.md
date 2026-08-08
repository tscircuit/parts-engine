# parts-engine

The tscircuit platform parts engine.

## Supplier engines

```ts
import {
  digikeyPartsEngine,
  jlcPartsEngine,
  DigiKeyPartsEngine,
} from "@tscircuit/parts-engine"
```

`digikeyPartsEngine.findPart(...)` queries
`https://digikeysearch.tscircuit.com`, which provides the same category route
shape as jlcsearch while caching DigiKey Product Information V4 calls. Use
`new DigiKeyPartsEngine({ platformFetch, apiBaseUrl })` to inject a platform
fetch implementation or a test/self-hosted endpoint.
