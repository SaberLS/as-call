import { ASCallBase } from './ASCallBase'
import type { Options, PendingStore } from './ASCallDedumpedTypes'
import type { ExtraWithCall, Request, ResponseManger } from './ASCallTypes'
import type { Handlers } from './Handlers'
import type { Response } from './Response/Response'

abstract class ASDedumpedCallBase<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TPendingStore extends PendingStore<TPayload, unknown>,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TExtraParams extends unknown[] = [],
  TGetParams extends unknown[] = ExtraWithCall<TExtraParams, TCallParams>,
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
  TExtraParams,
  TGetParams,
  THandlers,
  TResponseManager
> {
  protected pendingStore: TPendingStore

  constructor(
    request: Request<TCallParams, TPayload>,
    options: Options<
      TPayload,
      TError,
      ExtraWithCall<TExtraParams, TCallParams>,
      TPendingStore,
      TGetParams,
      TResponse,
      TResponseSuccess,
      TResponseFailure,
      THandlers,
      TResponseManager
    >
  ) {
    const { pendingStore, ...superOptions } = options
    super(request, superOptions)

    this.pendingStore = pendingStore
  }
}

export { ASDedumpedCallBase }
