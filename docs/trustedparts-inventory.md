# TrustedParts Inventory API: server-only integration foundation

This opt-in client provides an authenticated, tested request transport. It
does **not** create a public inventory API/proxy or serve data to third parties.

IMPORTANT: Deployment to a public tscircuit site requires review of the
[TrustedParts API terms](https://www.trustedparts.com/en/docs/api/trustedparts-api/terms-of-use).
In particular, ECIA restricts public redistribution of API responses and
requires specific consent for non-internal response caching. Never publish
supplier credentials.

## Server-side example

Import TrustedPartsInventoryClient from @tscircuit/parts-engine. Instantiate
using TRUSTEDPARTS_COMPANY_ID and TRUSTEDPARTS_API_KEY loaded from **server-only**
secret settings. Supply a truthful UserAgent or internal application ID.
Call search({ queries: [{ searchToken: "LM358" }] }). The client requests\nreal-time stock and pricing by default (UseCachedData: false); set\nuseCachedData: true only when the less-fresh provider cache is appropriate.

The client forwards the upstream response without combining it with other
supplier catalogs, stripping product links, or removing attribution.

## Constraints

- Real TrustedParts credentials and API approval are required for live tests.
- Up to 50 part-number queries per request (each token 2–100 characters).\n  Supplier filtering by distributors applies to the entire batch, not each\n  query. Partial matching is supported for one non-crawler query only.\n- No automatic retries, default
  10-second timeout; use your own authenticated server rate limiter.
- Zero persistent response caching by default. Identical simultaneous
  requests are coalesced only in-memory while pending.
- Optional bounded in-process cache requires explicit permission and is
  limited to a 7-day maximum TTL, with manual clearCache().
- Website applications need the visitor's real public SourceIp and UserAgent
  per the supplier terms. Internal apps require a unique application/user ID.
- Backend owners must assess terms for any public use, permissions,
  attribution, and geographic/export obligations before exposing results.
- The module is not a replacement for a dedicated access-controlled proxy.
  A multi-instance deployment must enforce shared rate budgets and identity.
- Unit tests use only injected mock responses. No live supplier calls or
  credentials are used in CI.

Reference:
https://www.trustedparts.com/en/docs/api/trustedparts-api/version-2
https://www.trustedparts.com/en/docs/api/trustedparts-api/requests
