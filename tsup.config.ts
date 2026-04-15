import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./index.ts"],
  format: ["esm"],
  sourcemap: true,
  noExternal: ["easyeda"],
  clean: true,
  dts: true,
})
