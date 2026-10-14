export const getPartsEngineUrl = ({
  path,
  baseUrl,
  environmentVariable,
  defaultBaseUrl,
}: {
  path: string
  baseUrl?: string
  environmentVariable: string
  defaultBaseUrl: string
}): URL => {
  const environmentBaseUrl =
    typeof process === "undefined"
      ? undefined
      : process.env?.[environmentVariable]
  const resolvedBaseUrl = baseUrl ?? environmentBaseUrl ?? defaultBaseUrl
  return new URL(
    path.replace(/^\/+/, ""),
    `${resolvedBaseUrl.replace(/\/+$/, "")}/`,
  )
}
