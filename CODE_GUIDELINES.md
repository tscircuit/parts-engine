# tscircuit Code

tscircuit code has a consistent pragmatic style with an emphasis on readability.

## 1. Two-Parameter Rule

We never use more than two parameters in a function, whenever there are more than two parameters we either...

1. Convert to "named parameters" and take a single parameter as an object
2. Switch to the context passing pattern.

```ts
// GOOD: single named-parameter object
function renderSymbol(params: { symbolName: string; x: number; y: number; ccwRotationDegrees: number }) {}
renderSymbol({ symbolName: "ground_down", x: 5, y: 10, ccwRotationDegrees: 90 })

// BAD: positional params, call site is unreadable
function renderSymbol(symbolName: string, x: number, y: number, rotation: number) {}
renderSymbol("ground_down", 5, 10, 90)
```

- [core#422](https://github.com/tscircuit/core/pull/422#discussion_r1885804180)

## 2. Context-Passing Pattern

The context-passing pattern means using a two-parameter function where...
- the first parameter is a function-specific named object
- the second parameter is a common named object ("the context")

```ts
// GOOD: function-specific params first, shared context second
export function renderSymbol(params: { symbolName: string; shape: any }, ctx: AppContext) {
  // ...
}

// BAD: context fields spread into params — no reusable context, grows unbounded
export function renderSymbol(params: {
  symbolName: string
  shape: any
  db: Db
  logger: Logger
  config: Config
}) {
  // ...
}
```

When using the context-passing pattern, the most important thing is to make sure you're not inventing too many contexts. Generally
there will be one or two obvious contexts for an app. It's common to create a named interface like `AuthContext` or `ComponentContext`

- [core#422](https://github.com/tscircuit/core/pull/422#discussion_r1885804180)

## 3. Banned Words

There are some words that are so bad, that a more domain-specific word is always better.

- `data`, `info`, `value`, `param` - Just "say the thing"

```ts
// GOOD: say the thing
const currentOrderDetails = await getCart()
const userProfile = res.body
function normalizeNet(net) {}

// BAD: vague filler words
const cartData = await getCart()
const userInfo = res.body
function process(value) {}
```

## 4. Casing

We use the "google-style" convention for determining words. Here's a basic algorithm you can follow:

1. Convert your name into `snake_case`: `my_profile_id`
2. Capitalize each word (except the first for `camelCase`): `my_Profile_Id`
3. Remove the underscores: `myProfileId`

Notice that this clears up naming for many words such as `Api` and `Id` which are commonly capitalized in
other naming systems.

```ts
// GOOD: google-style algorithm applied
const myProfileId = ...
const fetchApiResponse = ...
class HttpClient {}

// BAD: ad-hoc capitalization
const myProfileID = ...
const fetchAPIResponse = ...
class HTTPClient {}
```

### 4.1 Database, Circuit JSON

Some objects use snake casing because they're "inheriting the API convention" which specifies underscores. This
is common and OK. Just keep in mind you'll want to use `snake_case` for these objects, even as you pass them
around.

### 4.2 Enum Strings

Enum strings should always be `"snake_case"` in every context. For example: `"circular_plated_hole"`


## 5. Variable Transparency (DO NOT RENAME UNLESS DISAMBIGUATING)

Variable transparency means a variable has the same name as it traverses throughout the codebase.

To a developer, this means if they see the word `db`, they immediately know it's type because it
never changes meaning.

Similarly, if they see `cartItemList` they know that it is the same type as everywhere else in the
code. It has never been renamed, and there is no alternate variable name for that same type.

There is an exception to this, say you have `userProfile` but you have two `userProfile`s in the same
function. In this case, you should **rename both of the variables to disambiguate (differentiate) them**

```ts
const currentUserProfile = userProfile
const friendUserProfile = await getFriend(userProfile)
```

### 5.1 Never Rename a Transparent Variable

This is a common mistake when working between `snake_case` and `camelCase` code. Do not rename variables,
keep them the same unless you are disambiguating

```ts
// BAD: DO NOT DO THIS
const userProfile = ctx.user_profile
```

## 6. Use Conventional Clear Naming

Names should be clear and conventional.

### Common Naming Mistakes

- `rotation` (if a number) must have a unit and direction
  - GOOD: `ccwRotationDegrees`
  - BAD: `rotation`
- Matrices that represent a transform should always specify the from/to coordinate space
  - GOOD: `realToPxTransform`, `realToSvgMat`
  - BAD: `mat`, `transform`


## 7. Use `transformation-matrix` when computing 2d transformations. Do Not Write Math With Scaling!

Math with scaling is unmaintainable and easy to mess up.

# AI-Generated Code Guidelines

## 1. Avoid polluting entrypoint files

A high-level file — the CLI entrypoint, the main export, a top-level `index.ts` —
should contain high-level calls, not the implementations. Keep the logic in sibling
modules and import it, so the entrypoint reads like a summary.

```ts
// GOOD: index.ts imports and orchestrates
import { getCircuitFiles } from "./get-circuit-files"
import { renderFilesToCircuitJson } from "./render-files-to-circuit-json"
import { writeBuildOutput } from "./write-build-output"

export async function build(opts: BuildOptions) {
  const files = await getCircuitFiles(opts.dir)
  const circuitJson = await renderFilesToCircuitJson(files)
  await writeBuildOutput(circuitJson, opts)
}

// BAD: index.ts defines every helper itself
function getCircuitFiles(dir: string) { /* ...20 lines... */ }
function renderFilesToCircuitJson(files: string[]) { /* ...40 lines... */ }
function writeBuildOutput(json: CircuitJson, opts: BuildOptions) { /* ...30 lines... */ }

export async function build(opts: BuildOptions) {
  const files = getCircuitFiles(opts.dir)
  const circuitJson = renderFilesToCircuitJson(files)
  writeBuildOutput(circuitJson, opts)
}
```

AI assistants tend to stuff entrypoint files, defining every helper inline instead
of splitting them into their own modules.

## 2. Avoid Named Closures

When defining a large function, avoid declaring named functions inside of it. It's
rarely appropriate when a higher-scoped function is possible — a hoisted function is
easier to test, reuse, and read.

```ts
// GOOD: hoist it to module scope
function normalizeNet(net: Net) {
  // ...
}

function processNets(nets: Net[]) {
  return nets.map(normalizeNet)
}

// BAD: named closure trapped inside the function
function processNets(nets: Net[]) {
  function normalizeNet(net: Net) {
    // ...
  }
  return nets.map(normalizeNet)
}
```

Anonymous inline callbacks (`nets.map((net) => ...)`) are fine. This rule targets
*named* `function foo()` / `const foo = () => ...` declarations nested inside a
larger function body.

## 3. Avoid `as any` or `as unknown`

`as any` and `as unknown` disable type checking exactly where bugs hide. AI
assistants reach for them to silence a type error instead of fixing the type.

```ts
// GOOD: type the value, let the compiler catch mistakes
const pkg = JSON.parse(body) as Package
ship(pkg.pakage_id) // compile error: did you mean package_id?

// BAD: casts away the error, loses all type safety
const pkg = JSON.parse(body) as any
ship(pkg.pakage_id) // typo silently compiles, fails at runtime
```
