/** Enforce the deadline even when custom fetch/body readers ignore abort. */
export const withDatasheetRequestTimeout = async <T>(
  request: (signal: AbortSignal) => Promise<T>,
): Promise<T> => {
  const signal = AbortSignal.timeout(5_000)
  let rejectOnAbort: () => void = () => {}
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectOnAbort = () =>
      reject(
        new Error(
          "Datasheet API did not respond within 5 seconds; pin attributes may not be populated",
        ),
      )
    if (signal.aborted) rejectOnAbort()
    else signal.addEventListener("abort", rejectOnAbort, { once: true })
  })
  try {
    return await Promise.race([request(signal), aborted])
  } finally {
    signal.removeEventListener("abort", rejectOnAbort)
  }
}
