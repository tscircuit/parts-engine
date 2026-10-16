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

export const getPinHeaderRowCount = (
  sourceComponent: Record<string, unknown>,
  footprinterString?: string,
): number | undefined => {
  if (footprinterString) {
    const rowsMatch = footprinterString.match(/(?:^|_)rows(\d+)(?:_|$)/i)
    if (rowsMatch) {
      return Number(rowsMatch[1])
    }
    if (/^pinrow\d+(?:_|$)/i.test(footprinterString)) {
      return 1
    }
  }

  if (
    typeof sourceComponent.num_rows === "number" &&
    Number.isFinite(sourceComponent.num_rows)
  ) {
    return sourceComponent.num_rows
  }
  if (
    typeof sourceComponent.row_count === "number" &&
    Number.isFinite(sourceComponent.row_count)
  ) {
    return sourceComponent.row_count
  }
  if (
    sourceComponent.double_row === true ||
    sourceComponent.doubleRow === true
  ) {
    return 2
  }

  return undefined
}

const isKnownPinHeaderGender = (gender: unknown): gender is "male" | "female" =>
  gender === "male" || gender === "female"

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
  const isRightAngle =
    sourceComponent.is_right_angle ??
    sourceComponent.right_angle ??
    sourceComponent.rightAngle

  return {
    ...(pitch ? { pitch } : {}),
    ...(typeof numPins === "number" ? { num_pins: numPins } : {}),
    ...(gender ? { gender } : {}),
    ...(typeof isRightAngle === "boolean"
      ? { is_right_angle: isRightAngle }
      : {}),
  }
}
