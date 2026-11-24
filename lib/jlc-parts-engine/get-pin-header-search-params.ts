const parseMillimeters = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return undefined

  const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:\s*mm)?$/i)
  if (!match) return undefined

  return Number(match[1])
}

const parsePinHeaderPitchFromFootprinterString = (
  footprinterString?: string,
): number | undefined => {
  const match = footprinterString?.match(
    /(?:^|_)p(\d+(?:\.\d+)?)(?:mm)?(?:_|$)/i,
  )
  return match ? Number(match[1]) : undefined
}

const isKnownPinHeaderGender = (gender: unknown): gender is "male" | "female" =>
  gender === "male" || gender === "female"

const isPinRowFootprinterString = (footprinterString?: string): boolean =>
  typeof footprinterString === "string" &&
  /^pinrow\d+(?:_|$)/i.test(footprinterString.trim())

const isRightAngleFootprinterString = (footprinterString?: string): boolean =>
  typeof footprinterString === "string" &&
  /(?:^|_)right_?angle(?:_|$)/i.test(footprinterString.trim())

const isSmdFootprinterString = (footprinterString?: string): boolean =>
  typeof footprinterString === "string" &&
  /(?:^|_)(?:smd|smt)(?:_|$)/i.test(footprinterString.trim())

const resolveIsRightAngle = (
  sourceComponent: Record<string, unknown>,
  footprinterString?: string,
): boolean | undefined => {
  const explicit =
    sourceComponent.is_right_angle ??
    sourceComponent.right_angle ??
    sourceComponent.rightAngle
  if (typeof explicit === "boolean") return explicit
  if (isRightAngleFootprinterString(footprinterString)) return true
  if (isPinRowFootprinterString(footprinterString)) return false
  return undefined
}

const SMD_PACKAGE_RE = /\b(?:smd|smt)\b|surface[\s-]*mount|贴片|卧贴|立贴/i
const SMD_MOUNTING_STYLE_RE =
  /\b(?:smd|smt)\b|surface[\s-]*mount|standing[\s-]*paste|贴片|卧贴|立贴/i
const SMD_DESCRIPTION_RE = /\b(?:smd|smt)\b|surface[\s-]*mount/i

export const isSmdPinHeaderPart = (
  header: Record<string, unknown>,
): boolean => {
  if (header.is_smd === true) return true
  if (
    typeof header.package === "string" &&
    SMD_PACKAGE_RE.test(header.package)
  ) {
    return true
  }
  if (
    typeof header.mounting_style === "string" &&
    SMD_MOUNTING_STYLE_RE.test(header.mounting_style)
  ) {
    return true
  }
  if (
    typeof header.description === "string" &&
    SMD_DESCRIPTION_RE.test(header.description)
  ) {
    return true
  }
  return false
}

export const getPinHeaderSearchParams = (
  sourceComponent: Record<string, unknown>,
  footprinterString?: string,
) => {
  const pitch =
    parseMillimeters(sourceComponent.pitch) ??
    parsePinHeaderPitchFromFootprinterString(footprinterString)
  const numPins =
    sourceComponent.pin_count ??
    sourceComponent.pinCount ??
    sourceComponent.num_pins
  const gender = isKnownPinHeaderGender(sourceComponent.gender)
    ? sourceComponent.gender
    : undefined
  const isRightAngle = resolveIsRightAngle(sourceComponent, footprinterString)

  return {
    ...(pitch ? { pitch } : {}),
    ...(typeof numPins === "number" ? { num_pins: numPins } : {}),
    ...(gender ? { gender } : {}),
    ...(typeof isRightAngle === "boolean"
      ? { is_right_angle: isRightAngle }
      : {}),
  }
}

export const filterPinHeaderParts = <T extends Record<string, unknown>>(
  headers: T[] | undefined,
  sourceComponent: Record<string, unknown>,
  footprinterString?: string,
): T[] => {
  if (!Array.isArray(headers)) return []

  const expectedRightAngle = resolveIsRightAngle(
    sourceComponent,
    footprinterString,
  )
  const wantsSmd =
    sourceComponent.is_smd === true ||
    sourceComponent.smd === true ||
    isSmdFootprinterString(footprinterString)
  const wantsThroughHole =
    !wantsSmd &&
    (sourceComponent.is_smd === false ||
      sourceComponent.smd === false ||
      isPinRowFootprinterString(footprinterString) ||
      (typeof footprinterString === "string" &&
        /(?:^|_)id\d/i.test(footprinterString)))

  return headers.filter((header) => {
    if (
      typeof expectedRightAngle === "boolean" &&
      typeof header.is_right_angle === "boolean" &&
      header.is_right_angle !== expectedRightAngle
    ) {
      return false
    }
    if (wantsThroughHole && isSmdPinHeaderPart(header)) {
      return false
    }
    if (wantsSmd && header.is_smd === false) {
      return false
    }
    return true
  })
}
