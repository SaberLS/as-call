class Response<TPayload, TError, TSuccess extends boolean = boolean> {
  protected payload: TPayload | undefined
  protected error: TError | undefined
  protected success: TSuccess

  constructor(success: TSuccess, payload?: TPayload, error?: TError) {
    this.payload = payload
    this.error = error
    this.success = success
  }

  setError(error: TError | undefined) {
    this.error = error
  }

  getError() {
    return this.error
  }

  setPayload(payload: TPayload | undefined) {
    this.payload = payload
  }

  getPayload() {
    return this.payload
  }

  setSuccess(success: TSuccess) {
    this.success = success
  }

  isSuccessfull() {
    return this.success
  }
}

export { Response }
