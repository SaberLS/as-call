class Response<TPayload, TError, TSuccess extends boolean = boolean> {
  private readonly payload: TPayload
  private readonly error: TError
  private readonly success: TSuccess

  constructor(success: TSuccess, payload: TPayload, error: TError) {
    this.payload = payload
    this.error = error
    this.success = success
  }

  getError() {
    return this.error
  }

  getPayload() {
    return this.payload
  }

  isSuccessfull() {
    return this.success
  }
}

export { Response }
