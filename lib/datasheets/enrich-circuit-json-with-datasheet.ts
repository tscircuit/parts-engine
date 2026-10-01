import type { PinAttributeMap } from "@tscircuit/props"
import type { AnyCircuitElement, SourcePinAttributes } from "circuit-json"
import type { DatasheetInformation } from "./types"

/** Match core's applyPinAttributesToSourcePort using canonical Circuit JSON fields. */
const toSourcePinAttributes = (
  attributes: PinAttributeMap,
): SourcePinAttributes => {
  const converted: SourcePinAttributes = {
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
  for (const key of Object.keys(converted) as (keyof SourcePinAttributes)[]) {
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
    // Prefer the physical number. A shared label (e.g. VDD) is never a pin key.
    const pinKey =
      element.pin_number !== undefined
        ? `pin${element.pin_number}`
        : /^pin[0-9A-Za-z]+$/.test(element.name)
          ? element.name
          : undefined
    const attributes = pinKey ? datasheet.pinAttributes?.[pinKey] : undefined
    if (!attributes) return element
    return { ...element, ...toSourcePinAttributes(attributes) }
  })
}
