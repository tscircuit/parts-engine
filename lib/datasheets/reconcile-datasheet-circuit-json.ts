import {
  source_pin_attributes,
  type AnyCircuitElement,
  type SourcePinAttributes,
  type SourcePort,
} from "circuit-json"

export type DatasheetReconciliation = {
  circuitJson: AnyCircuitElement[]
  matchedSourcePortIds: string[]
  unmatchedSourcePortIds: string[]
  /** Matching a pin identity does not imply it has electrical attributes. */
  missingAttributeSourcePortIds: string[]
  unmatchedDatasheetSourcePortIds: string[]
  ambiguousMatches: {
    sourcePortId: string
    datasheetSourcePortIds: string[]
  }[]
}

const physicalKey = (port: SourcePort) =>
  port.pin_number !== undefined
    ? `pin${port.pin_number}`
    : /^pin(?:\d+|[A-Z]+\d+)$/.test(port.name)
      ? port.name
      : undefined

const normalizeManufacturerPartNumber = (partNumber: string) =>
  partNumber.trim().toLowerCase()

const getSourcePinAttributes = (port: SourcePort): SourcePinAttributes => {
  const attributes = source_pin_attributes.parse(port)
  for (const name of Object.keys(attributes) as (keyof SourcePinAttributes)[]) {
    if (attributes[name] === undefined) delete attributes[name]
  }
  return attributes
}

/** Pure reconciliation: never changes footprint geometry, IDs, or connectivity. */
export const reconcileDatasheetCircuitJson = ({
  circuitJson,
  datasheetCircuitJson,
  sourceComponentId,
  attributePriority = "datasheet",
}: {
  circuitJson: AnyCircuitElement[]
  datasheetCircuitJson: AnyCircuitElement[]
  /** Required when the target circuit contains more than one component. */
  sourceComponentId?: string
  /** Core can preserve explicit user attributes while filling absent fields. */
  attributePriority?: "datasheet" | "existing"
}): DatasheetReconciliation => {
  const components = circuitJson.filter((e) => e.type === "source_component")
  const target = sourceComponentId
    ? components.find((e) => e.source_component_id === sourceComponentId)
    : components.length === 1
      ? components[0]
      : undefined
  const datasheetComponents = datasheetCircuitJson.filter(
    (e) => e.type === "source_component",
  )
  if (!target || datasheetComponents.length !== 1)
    throw new Error(
      "Reconciliation requires one datasheet component and an explicit target component",
    )
  const manufacturerPartNumber =
    datasheetComponents[0]!.manufacturer_part_number
  if (
    target.manufacturer_part_number &&
    manufacturerPartNumber &&
    normalizeManufacturerPartNumber(target.manufacturer_part_number) !==
      normalizeManufacturerPartNumber(manufacturerPartNumber)
  )
    throw new Error(
      `Cannot reconcile ${manufacturerPartNumber}: imported part is ${target.manufacturer_part_number}`,
    )

  const datasheetPorts = datasheetCircuitJson.filter(
    (e): e is SourcePort =>
      e.type === "source_port" &&
      e.source_component_id === datasheetComponents[0]!.source_component_id,
  )
  const physicalPorts = new Map<string, SourcePort[]>()
  const labelPorts = new Map<string, SourcePort[]>()
  for (const port of datasheetPorts) {
    const key = physicalKey(port)
    const index = key ? physicalPorts : labelPorts
    const name = key ?? port.name
    index.set(name, [...(index.get(name) ?? []), port])
  }
  const used = new Set<string>()
  const result: DatasheetReconciliation = {
    circuitJson: [],
    matchedSourcePortIds: [],
    unmatchedSourcePortIds: [],
    missingAttributeSourcePortIds: [],
    unmatchedDatasheetSourcePortIds: [],
    ambiguousMatches: [],
  }
  result.circuitJson = circuitJson.map((element) => {
    if (
      element.type !== "source_port" ||
      element.source_component_id !== target.source_component_id
    )
      return element
    const key = physicalKey(element)
    const direct = key ? physicalPorts.get(key) : undefined
    // Numeric supplier ports can carry the actual BGA ball in a hint. Use that
    // physical identity when the datasheet has no matching numeric pin.
    const hinted = [
      ...new Set([element.name, ...(element.port_hints ?? [])]),
    ].flatMap(
      (hint) =>
        physicalPorts.get(hint.startsWith("pin") ? hint : `pin${hint}`) ?? [],
    )
    const matches = [...new Set(direct?.length ? direct : hinted)]
    const importedLabels = [
      ...new Set([...(element.port_hints ?? []), element.name]),
    ].flatMap((label) => labelPorts.get(label) ?? [])
    const labels = [
      ...new Set(
        importedLabels.length
          ? importedLabels
          : matches.flatMap((port) =>
              (port.port_hints ?? []).flatMap(
                (label) => labelPorts.get(label) ?? [],
              ),
            ),
      ),
    ]
    const candidates = [...labels, ...matches]
    const physicalAttributes =
      matches.length === 1 ? getSourcePinAttributes(matches[0]!) : {}
    const attributes: SourcePinAttributes = {}
    let conflictingLabels = false
    for (const port of labels) {
      const next = getSourcePinAttributes(port)
      for (const name of Object.keys(next) as (keyof SourcePinAttributes)[]) {
        if (
          attributes[name] !== undefined &&
          attributes[name] !== next[name] &&
          physicalAttributes[name] === undefined
        )
          conflictingLabels = true
      }
      Object.assign(attributes, next)
    }
    if (matches.length > 1 || conflictingLabels) {
      result.ambiguousMatches.push({
        sourcePortId: element.source_port_id,
        datasheetSourcePortIds: candidates.map((p) => p.source_port_id),
      })
      result.missingAttributeSourcePortIds.push(element.source_port_id)
      return element
    }
    Object.assign(attributes, physicalAttributes)
    for (const port of candidates) used.add(port.source_port_id)
    if (candidates.length)
      result.matchedSourcePortIds.push(element.source_port_id)
    else result.unmatchedSourcePortIds.push(element.source_port_id)
    if (!Object.keys(attributes).length) {
      result.missingAttributeSourcePortIds.push(element.source_port_id)
      return element
    }
    return attributePriority === "existing"
      ? { ...element, ...attributes, ...getSourcePinAttributes(element) }
      : { ...element, ...attributes }
  })
  result.unmatchedDatasheetSourcePortIds = datasheetPorts
    .filter((port) => !used.has(port.source_port_id))
    .map((port) => port.source_port_id)
  return result
}
