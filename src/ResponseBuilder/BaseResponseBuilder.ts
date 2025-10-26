import { Response } from '../Response/Response'

abstract class BaseResponseBuilder<
  TPayload,
  TError extends Error,
  TStart,
  TFailure extends Response<unknown, TError, false>,
  TSuccess extends Response<TPayload, undefined, true>,
> extends Response<TPayload, TError> {
  private _initialized = false

  reset() {
    this._initialized = false

    super.setError(undefined)
    super.setPayload(undefined)
    super.setSuccess(false)
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
    super.setPayload(payload)
  }

  setError(error: TError | undefined) {
    this.initGuard()
    super.setError(error)
  }

  setSuccess(success: boolean) {
    this.initGuard()
    super.setSuccess(success)
  }

  initGuard() {
    if (!this.isInitialized()) throw new Error('Builder not initialized')
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
