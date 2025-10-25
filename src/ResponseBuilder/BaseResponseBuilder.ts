import {
  Response,
  type ResponseFailure,
  type ResponseSuccess,
} from '../Response/Response'

abstract class BaseResponseBuilder<
  TPayload,
  TError extends Error,
  TStart,
  TFailure extends ResponseFailure<TError>,
  TSuccess extends ResponseSuccess<TPayload>,
> extends Response<TPayload, TError> {
  private _initialized = false

  reset() {
    this._initialized = false

    this.setError(undefined)
    this.setPayload(undefined)
    this.setSuccess(false)
  }

  init() {
    this._initialized = true
    return this.start()
  }

  getPayload() {
    this.initGuard()
    return super.getPayload()!
  }

  getError() {
    this.initGuard()
    return super.getError()!
  }

  isInitialized() {
    return this._initialized
  }

  setPayload(payload: TPayload | undefined) {
    this.initGuard()
    this.payload = payload
  }

  setError(error: TError | undefined) {
    this.initGuard()
    this.error = error
  }

  setSuccess(success: boolean) {
    this.initGuard()
    this.success = success
  }

  initGuard() {
    if (this.isInitialized()) throw new Error('Builder not initialized')
  }

  build() {
    this.initGuard()

    return this.isSuccessfull() ? this.succed() : this.fail()
  }

  abstract start(): TStart
  abstract succed(): TSuccess
  abstract fail(): TFailure
}

export { BaseResponseBuilder }
