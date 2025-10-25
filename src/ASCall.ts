import { ASCallBase, type Options, type Reguest } from './ASCallBase'
import { ASCallHandlers } from './ASCallHandlers'

class ASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<TPayload, TCallParams, TGetParams, Error> {
  readonly handlers: ASCallHandlers<TPayload, Error>

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<Options<TPayload, TCallParams, TGetParams, Error>>
  ) {
    super(request, options)

    this.handlers = new ASCallHandlers<TPayload, Error>(options?.handlers)
  }
  parseError(error_: unknown): Error | Promise<Error> {
    if (error_ instanceof Error) return error_

    return new Error('Unknown Error', { cause: error_ })
  }
}

export { ASCall }
