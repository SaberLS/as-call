import { ResponseFailure, type ResponseSuccess } from './Response/Response'

abstract class Handlers<
  TPayload,
  TError extends Error,
  TSuccessBuilder extends (...args: never[]) => TSuccess,
  TFailureBuilder extends (...args: never[]) => TFailure,
  TSuccess extends ResponseSuccess<TPayload>,
  TFailure extends ResponseFailure<TError>,
> {
  protected onStart: OnStart | undefined
  protected onSuccess: OnSuccess<TSuccess> | undefined
  protected onFailure: OnFailure<TFailure> | undefined
  protected onFinal: OnFinal<TSuccess | TFailure> | undefined

  constructor(handlers?: Partial<Options<TSuccess, TFailure>>) {
    this.onStart = handlers?.onStart
    this.onSuccess = handlers?.onSuccess
    this.onFailure = handlers?.onFailure
    this.onFinal = handlers?.onFinal
  }

  protected abstract buildSuccessResult: TSuccessBuilder
  protected abstract buildFailureResult: TFailureBuilder

  handleStart = () => {
    this.onStart?.()
  }

  handleSuccess = (...args: Parameters<TSuccessBuilder>) => {
    const response = this.buildSuccessResult(...args)
    this.onSuccess?.(response)

    return response
  }

  handleFailure = (...args: Parameters<TFailureBuilder>) => {
    const response = this.buildFailureResult(...args)
    this.onFailure?.(response)

    return response
  }

  handleFinal = (response: TSuccess | TFailure) => {
    this.onFinal?.(response)
  }
}

interface Options<TSuccess, TFailure> {
  onStart: OnStart
  onSuccess: OnSuccess<TSuccess>
  onFailure: OnFailure<TFailure>
  onFinal: OnFinal<TSuccess | TFailure>
}

type Handler<TResponse> = (response: TResponse) => void

type OnStart = () => void
type OnSuccess<TSuccess> = Handler<TSuccess>
type OnFailure<TFailure> = Handler<TFailure>
type OnFinal<TResponse> = Handler<TResponse>

export { Handlers }
