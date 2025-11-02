import { Response } from './Response'

class ResponseTimestamped<
  TPayload,
  TError,
  TSuccess extends boolean = boolean,
> extends Response<TPayload, TError, TSuccess> {
  private readonly timestamp: number

  constructor(
    success: TSuccess,
    payload: TPayload,
    error: TError,
    timestamp = Date.now()
  ) {
    super(success, payload, error)
    this.timestamp = timestamp
  }

  getTimestamp() {
    return this.timestamp
  }
}

export { ResponseTimestamped }
