import { ASCallBase } from './ASCallBase'
import type { ResponseManger } from './ASCallTypes'
import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

class ASCall<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TGetParams extends unknown[] = TCallParams,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  > = Handlers<[response: TResponse], TResponseSuccess, TResponseFailure>,
  TResponseManager extends ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  > = ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  >,
> extends ASCallBase<
  TPayload,
  TError,
  TCallParams,
  TResponse,
  TResponseSuccess,
  TResponseFailure,
  [],
  TGetParams,
  THandlers,
  TResponseManager
> {
  async makeRequest(...parameters: TCallParams): Promise<TPayload> {
    const payload = await this.request(...parameters)
    return payload
  }
}

export { ASCall }
