abstract class Response<TPayload, TError> {
  protected payload: TPayload | undefined
  protected error: TError | undefined
  protected success: boolean

  constructor(success: boolean, payload?: TPayload, error?: TError) {
    this.payload = payload
    this.error = error
    this.success = success
  }

  getError() {
    return this.error
  }

  getPayload() {
    return this.error
  }

  isSuccessfull() {
    return this.success
  }
}

class ResponseSuccess<TPayload> extends Response<TPayload, never> {
  constructor(payload: TPayload) {
    super(true, payload)
  }
}

class ResponseFailure<TError> extends Response<unknown, TError> {
  constructor(payload: unknown, error: TError) {
    super(false, payload, error)
  }
}
export { Response, ResponseFailure, ResponseSuccess }
