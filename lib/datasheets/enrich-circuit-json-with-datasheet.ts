import type { PinAttributeMap } from "@tscircuit/props"
import type { AnyCircuitElement, SourcePinAttributes } from "circuit-json"
import type { DatasheetInformation } from "./types"

/** Match core's applyPinAttributesToSourcePort using canonical Circuit JSON fields. */
const toSourcePinAttributes = (
  attributes: PinAttributeMap,
): SourcePinAttributes => {
  // These props fields are added by tscircuit/circuit-json#850.
  // Keep them in the returned JSON even while older consumers upgrade.
  const additionalAttributes = {
    is_input: attributes.isInput,
    is_output: attributes.isOutput,
    is_bidirectional: attributes.isBidirectional,
    is_passive: attributes.isPassive,
    can_use_tri_state: attributes.canUseTriState,
    is_using_tri_state: attributes.isUsingTriState,
    can_use_open_collector: attributes.canUseOpenCollector,
    is_using_open_collector: attributes.isUsingOpenCollector,
    can_use_open_emitter: attributes.canUseOpenEmitter,
    is_using_open_emitter: attributes.isUsingOpenEmitter,
    is_gpio: attributes.isGpio,
    highlight_color: attributes.highlightColor,
  }
  const converted: SourcePinAttributes & typeof additionalAttributes = {
    ...additionalAttributes,
    must_be_connected: attributes.mustBeConnected,
    provides_power: attributes.providesPower,
    requires_power: attributes.requiresPower,
    provides_ground: attributes.providesGround,
    requires_ground: attributes.requiresGround,
    provides_voltage: attributes.providesVoltage,
    requires_voltage: attributes.requiresVoltage,
    do_not_connect: attributes.doNotConnect,
    include_in_board_pinout: attributes.includeInBoardPinout,
    can_use_internal_pullup: attributes.canUseInternalPullup,
    is_using_internal_pullup: attributes.isUsingInternalPullup,
    needs_external_pullup: attributes.needsExternalPullup,
    can_use_internal_pulldown: attributes.canUseInternalPulldown,
    is_using_internal_pulldown: attributes.isUsingInternalPulldown,
    needs_external_pulldown: attributes.needsExternalPulldown,
    can_use_open_drain: attributes.canUseOpenDrain,
    is_using_open_drain: attributes.isUsingOpenDrain,
    can_use_push_pull: attributes.canUsePushPull,
    is_using_push_pull: attributes.isUsingPushPull,
    should_have_decoupling_capacitor: attributes.shouldHaveDecouplingCapacitor,
    recommended_decoupling_capacitor_capacitance:
      attributes.recommendedDecouplingCapacitorCapacitance,
  }
  for (const capability of attributes.capabilities ?? []) {
    converted[`supports_${capability}`] = true
  }
  for (const capability of [
    ...(attributes.activeCapabilities ?? []),
    ...(attributes.activeCapability ? [attributes.activeCapability] : []),
  ]) {
    converted[`is_configured_for_${capability}`] = true
  }
  for (const key of Object.keys(converted) as (keyof typeof converted)[]) {
    if (converted[key] === undefined) delete converted[key]
  }
  return converted
}

/** Enrich the single imported part without changing its geometry or pin identity. */
export const enrichCircuitJsonWithDatasheet = (
  circuitJson: AnyCircuitElement[],
  datasheet: DatasheetInformation,
): AnyCircuitElement[] => {
  const sourceComponents = circuitJson.filter(
    (element) => element.type === "source_component",
  )
  // A datasheet describes one part, not an arbitrary multi-component circuit.
  if (sourceComponents.length !== 1) return circuitJson
  const sourceComponent = sourceComponents[0]!
  return circuitJson.map((element) => {
    if (element === sourceComponent) {
      return { ...element, manufacturer_part_number: datasheet.chipName }
    }
    if (
      element.type !== "source_port" ||
      element.source_component_id !== sourceComponent.source_component_id
    )
      return element
    // Label keys follow TSX pinAttributes semantics, including shared labels.
    // An explicit physical-pin entry overrides label entries field by field.
    const pinKey =
      element.pin_number !== undefined
        ? `pin${element.pin_number}`
        : /^pin[0-9A-Za-z]+$/.test(element.name)
          ? element.name
          : undefined
    const pinInformation = pinKey
      ? datasheet.pinInformation?.find(
          (pin) => `pin${pin.pin_number}` === pinKey,
        )
      : undefined
    const importedLabelKeys = [
      ...(element.port_hints ?? []),
      element.name,
    ].filter((key) => key !== pinKey && datasheet.pinAttributes?.[key])
    // Some supplier symbols renumber pads (e.g. SK9822-A). When attributes
    // use signal labels, prefer the imported signal to a physical-number
    // fallback, otherwise unrelated pin roles would be merged together.
    const attributeKeys = new Set(
      importedLabelKeys.length > 0
        ? importedLabelKeys
        : (pinInformation?.name ?? []),
    )
    // Ensure the physical key is last even if it was already a name or hint.
    if (pinKey) {
      attributeKeys.delete(pinKey)
      attributeKeys.add(pinKey)
    }
    const attributes: PinAttributeMap = {}
    for (const key of attributeKeys) {
      Object.assign(attributes, datasheet.pinAttributes?.[key])
    }
    if (Object.keys(attributes).length === 0) return element
    return { ...element, ...toSourcePinAttributes(attributes) }
  })
}
