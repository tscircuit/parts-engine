import type { PinAttributeMap } from "@tscircuit/props"
import type { SourcePinAttributes } from "circuit-json"

/** Match core's applyPinAttributesToSourcePort using canonical Circuit JSON fields. */
export const toSourcePinAttributes = (
  attributes: PinAttributeMap,
): SourcePinAttributes => {
  const converted: SourcePinAttributes = {
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
