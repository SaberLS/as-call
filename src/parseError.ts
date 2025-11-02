const parseError = (error_: unknown): Error => {
  if (error_ instanceof Error) return error_

  return new Error('Unknown Error', { cause: error_ })
}

export { parseError }
