import type { ResponseFailure, ResponseSuccess } from '../Response/Response'

abstract class BaseResponseBuilder<
  TPayload,
  TError extends Error,
  TFailure extends ResponseFailure<TError>,
  TSuccess extends ResponseSuccess<TPayload>,
> {
  private _payload!: TPayload
  private _error!: TError
  private _success = false
  private _initialized = false

  reset = () => {
    this._initialized = false
  }
  init = () => {
    this._initialized = true
  }

  getPayload = () => this._payload
  getError = () => this._error

  setPayload = (payload: TPayload) => {
    this._payload = payload
  }

  setError = (error: TError) => {
    this._error = error
  }

  setSuccess = (success: boolean) => {
    this._success = success
  }

  build = () => {
    if (!this._initialized) throw new Error('Builder not initialized')

    const response = this._success ? this.succed() : this.fail()
    this.reset()
    return response
  }

  abstract succed: () => TSuccess
  abstract fail: () => TFailure
}

export { BaseResponseBuilder }
