import type { ChipProps } from "@tscircuit/props"

/** Datasheet metadata needed to generate a component; independent of API storage. */
export type DatasheetComponentData = {
  chip_name?: string
  pin_information?: { pin_number: string; name: string | string[] }[] | null
  generated_tsx?: string | null
  footprinter_string?: string | null
  pin_attributes?: ChipProps["pinAttributes"] | null
  internally_connected_pins?: ChipProps["internallyConnectedPins"] | null
  sch_pin_arrangement?: ChipProps["schPinArrangement"] | null
  symbol_tsx?: string | null
  builtin_symbol_name?: string | null
  supplier_part_numbers?: ChipProps["supplierPartNumbers"] | null
}
