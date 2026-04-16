import type { PartsEngine } from "@tscircuit/props"
import { JlcPartsEngine } from "./JlcPartsEngine"
import type { CreateJlcPartsEngineOptions } from "./types"

export { JlcPartsEngine }
export { cache } from "./jlc-parts-cache"
export type {
  PlatformFetch,
  FetchPartCircuitJsonParams,
  CreateJlcPartsEngineOptions,
} from "./types"

export const createJlcPartsEngine = (
  options: CreateJlcPartsEngineOptions = {},
): PartsEngine => new JlcPartsEngine(options)

export const jlcPartsEngine: PartsEngine = new JlcPartsEngine()
