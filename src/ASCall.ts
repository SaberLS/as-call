import { ASCallBase, type Options, type Reguest } from './ASCallBase'
import { ASCallHandlers } from './ASCallHandlers'
import { Response } from './Response/Response'
import { ResponseBuilder } from './ResponseBuilder/ResponseBuilder'

class ASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<
  TPayload,
  TCallParams,
  Response<TPayload, undefined, true>,
  Response<unknown, Error, false>,
  void,
  Error,
  TGetParams,
  ResponseBuilder<TPayload, Error>,
  ASCallHandlers<TPayload, Error>
> {
  readonly handlers: ASCallHandlers<TPayload, Error>
  readonly responseBuilder = new ResponseBuilder<TPayload, Error>(false)

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<
      Options<TCallParams, TGetParams> & {
        handlers: ConstructorParameters<
          typeof ASCallHandlers<TPayload, Error>
        >['0']
      }
    >
  ) {
    super(request, { getArgs: options?.getArgs, name: options?.name })

    this.handlers = new ASCallHandlers<TPayload, Error>(options?.handlers)
  }
  parseError(error_: unknown): Error | Promise<Error> {
    if (error_ instanceof Error) return error_

    return new Error('Unknown Error', { cause: error_ })
  }
}

export { ASCall }
