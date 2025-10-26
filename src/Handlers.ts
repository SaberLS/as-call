import { Response } from './Response/Response'
class Handlers<
  TStart,
  TSuccess extends Response<unknown, undefined, true>,
  TFailure extends Response<unknown, unknown, false>,
> {
  protected onStart: OnStart<TStart> | undefined
  protected onSuccess: OnSuccess<TSuccess> | undefined
  protected onFailure: OnFailure<TFailure> | undefined
  protected onFinal: OnFinal<TSuccess | TFailure> | undefined

  constructor(handlers?: Partial<Options<TStart, TSuccess, TFailure>>) {
    this.onStart = handlers?.onStart
    this.onSuccess = handlers?.onSuccess
    this.onFailure = handlers?.onFailure
    this.onFinal = handlers?.onFinal
  }

  handleStart = (start: TStart) => {
    this.onStart?.(start)
  }

  handleSuccess = (response: TSuccess) => {
    this.onSuccess?.(response)
  }

  handleFailure = (response: TFailure) => {
    this.onFailure?.(response)
  }

  handleFinal = (response: TSuccess | TFailure) => {
    this.onFinal?.(response)
  }
}

interface Options<TStart, TSuccess, TFailure> {
  onStart: OnStart<TStart>
  onSuccess: OnSuccess<TSuccess>
  onFailure: OnFailure<TFailure>
  onFinal: OnFinal<TSuccess | TFailure>
}

type Handler<TResponse> = (response: TResponse) => void

type OnStart<TStart> = (start: TStart) => void
type OnSuccess<TSuccess> = Handler<TSuccess>
type OnFailure<TFailure> = Handler<TFailure>
type OnFinal<TResponse> = Handler<TResponse>

export { Handlers }
