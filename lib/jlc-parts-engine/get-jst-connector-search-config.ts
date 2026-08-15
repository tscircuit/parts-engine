import type { SourceSimpleConnectorStandard } from "circuit-json"

type JstConnectorStandard = Extract<
  SourceSimpleConnectorStandard,
  `jst_${string}`
>

type JstConnectorSearchConfig = {
  pitchMm: number
  compatibleReferenceSeries: string[]
}

type JstConnector = {
  reference_series?: string
  attributes?: string | Record<string, unknown>
}

const jstConnectorSearchConfigByStandard = {
  jst_sh: {
    pitchMm: 1,
    compatibleReferenceSeries: ["SH", "SR/SZ"],
  },
  jst_gh: { pitchMm: 1.25, compatibleReferenceSeries: ["GH"] },
  jst_zh: { pitchMm: 1.5, compatibleReferenceSeries: ["ZH"] },
  jst_ph: { pitchMm: 2, compatibleReferenceSeries: ["PH"] },
  jst_xh: { pitchMm: 2.5, compatibleReferenceSeries: ["XH"] },
  jst_vh: { pitchMm: 3.96, compatibleReferenceSeries: ["VH"] },
} satisfies Record<JstConnectorStandard, JstConnectorSearchConfig>

export const getJstConnectorSearchConfig = (
  standard: SourceSimpleConnectorStandard | undefined,
): JstConnectorSearchConfig | undefined => {
  if (!standard || !(standard in jstConnectorSearchConfigByStandard)) {
    return undefined
  }

  return jstConnectorSearchConfigByStandard[standard as JstConnectorStandard]
}

const hasPcbPins = (attributes: JstConnector["attributes"]): boolean => {
  if (typeof attributes === "string") {
    return attributes.includes('"Pins Structure"')
  }

  return Boolean(attributes && Object.hasOwn(attributes, "Pins Structure"))
}

export const isCompatiblePcbMountJstConnector = (
  connector: JstConnector,
  compatibleReferenceSeries: string[],
): boolean =>
  compatibleReferenceSeries.includes(connector.reference_series ?? "") &&
  hasPcbPins(connector.attributes)
