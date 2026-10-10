export const getPinHeaderRowCount = (
  footprinterString?: string,
): number | undefined => {
  if (!footprinterString || !/^pinrow\d+(?:_|$)/i.test(footprinterString)) {
    return undefined
  }

  const rows = footprinterString.match(/(?:^|_)rows(\d+)(?:_|$)/i)
  // Generated pinrow footprints have one row unless explicitly overridden.
  return rows ? Number(rows[1]) : 1
}
