import { jlcPartsEngine } from "./lib/jlc-parts-engine"

const run = async () => {
  const result = await jlcPartsEngine.findPart({
    sourceComponent: {
      type: "source_component",
      ftype: "simple_resistor",
      resistance: "10k",
    },
    footprinterString: "0603",
  })
  console.log(result)
}

run()