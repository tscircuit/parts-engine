import type { CommonComponentProps } from "@tscircuit/props"
import type { AnyCircuitElement, SourcePort } from "circuit-json"
import { toSourcePinAttributes } from "./to-source-pin-attributes"

export type StoredDatasheetPins = {
  chipName: string
  pinInformation?: { pin_number: string; name: string[] }[] | null
  pinAttributes?: CommonComponentProps["pinAttributes"] | null
}

export const physicalPinKey = (pin: string) => `pin${pin.replace(/^pin/, "")}`

/** Convert registry metadata once, before any supplier/footprint reconciliation. */
export const convertDatasheetToCircuitJson = ({
  chipName,
  pinInformation,
  pinAttributes,
}: StoredDatasheetPins): AnyCircuitElement[] => {
  const sourceComponentId = `datasheet:${encodeURIComponent(chipName)}`
  const ports = new Map<string, SourcePort>()
  const consumedKeys = new Set<string>()
  for (const pin of pinInformation ?? []) {
    const key = physicalPinKey(pin.pin_number)
    if (ports.has(key)) throw new Error(`Duplicate datasheet pin ${key}`)
    const attributes = {
      ...pinAttributes?.[pin.pin_number],
      ...pinAttributes?.[key],
    }
    consumedKeys.add(pin.pin_number)
    consumedKeys.add(key)
    const number = key.slice(3)
    ports.set(key, {
      type: "source_port",
      source_component_id: sourceComponentId,
      source_port_id: `${sourceComponentId}:${encodeURIComponent(key)}`,
      name: key,
      ...(/^\d+$/.test(number) ? { pin_number: Number(number) } : {}),
      port_hints: [...new Set([key, number, ...pin.name])],
      ...toSourcePinAttributes(attributes),
    })
  }
  // Label-keyed attributes remain separate records. They must be resolved
  // against imported signal labels before falling back to manufacturer rows.
  for (const [key, attributes] of Object.entries(pinAttributes ?? {})) {
    if (consumedKeys.has(key)) continue
    const physical = /^pin(?:\d+|[A-Z]+\d+)$/.test(key)
    const number = key.slice(3)
    ports.set(key, {
      type: "source_port",
      source_component_id: sourceComponentId,
      source_port_id: `${sourceComponentId}:${encodeURIComponent(key)}`,
      name: key,
      ...(physical && /^\d+$/.test(number)
        ? { pin_number: Number(number) }
        : {}),
      port_hints: physical ? [key, number] : [key],
      ...toSourcePinAttributes(attributes),
    })
  }
  return [
    {
      type: "source_component",
      ftype: "simple_chip",
      source_component_id: sourceComponentId,
      name: chipName,
      manufacturer_part_number: chipName,
    },
    ...ports.values(),
  ]
}
