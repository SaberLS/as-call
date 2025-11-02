type Request<TCallParams extends unknown[], TPayload> = (
  ...args: TCallParams
) => Promise<TPayload>

export type { Request }
