abstract class Handlers<TPayload, TSuccessRes, TFailureRes> {
  protected onStart: OnStart | undefined
  protected onSuccess: Handler<TSuccessRes> | undefined
  protected onFailure: Handler<TFailureRes> | undefined
  protected onFinal: Handler<TSuccessRes | TFailureRes> | undefined

  constructor(handlers?: Partial<Options<TSuccessRes, TFailureRes>>) {
    this.onStart = handlers?.onStart
    this.onSuccess = handlers?.onSuccess
    this.onFailure = handlers?.onFailure
    this.onFinal = handlers?.onFinal
  }

  protected abstract buildSuccessResult: (payload: TPayload) => TSuccessRes
  protected abstract buildFailureResult: (payload: unknown) => TFailureRes

  handleStart = () => {
    this.onStart?.()
  }

  handleSuccess = (payload: TPayload) => {
    const response = this.buildSuccessResult(payload)
    this.onSuccess?.(response)

    return response
  }

  handleFailure = (payload: unknown) => {
    const response = this.buildFailureResult(payload)
    this.onFailure?.(response)

    return response
  }

  handleFinal = (response: TSuccessRes | TFailureRes) => {
    this.onFinal?.(response)
  }
}

interface Options<TSuccessRes, TFailureRes> {
  onStart: () => void
  onSuccess: Handler<TSuccessRes>
  onFailure: Handler<TFailureRes>
  onFinal: Handler<TSuccessRes | TFailureRes>
}

type Handler<TResponse> = (response: TResponse) => void
type OnStart = () => void

export { Handlers }
