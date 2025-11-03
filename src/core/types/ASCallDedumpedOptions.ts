import type { Response, ResponseManger } from '../../response'
import type { ASCallBaseOptions } from './ASCallBaseOptions'
import type { Handlers } from './Handlers'
import type { PendingStoreBase } from './PendingStore'

interface ASCallDedumpedOptions<
  TPayload,
  TError,
  TCallParams extends unknown[],
  TPendingStore extends PendingStoreBase<TPayload>,
  TGetParams extends unknown[],
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  >,
  TResponseManager extends ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  >,
> extends ASCallBaseOptions<
    TPayload,
    TError,
    TCallParams,
    TGetParams,
    TResponse,
    TResponseSuccess,
    TResponseFailure,
    THandlers,
    TResponseManager
  > {
  pendingStore: TPendingStore
}

export type { ASCallDedumpedOptions }
