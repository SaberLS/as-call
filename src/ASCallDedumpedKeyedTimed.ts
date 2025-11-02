import { ASDedumpedCallBase } from './ASCallDedumpedBase'
import type { PendingStoreKeyedTimed } from './ASCallDedumpedTypes'
import type { ResponseManger } from './ASCallTypes'
import type { Handlers } from './Handlers'
import type { Response } from './Response/Response'

class ASCallDedumpedKeyedTimed<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TPendingStore extends PendingStoreKeyedTimed<TPayload, TKey>,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TKey = number,
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
> extends ASDedumpedCallBase<
  TPayload,
  TError,
  TCallParams,
  TPendingStore,
  TResponse,
  TResponseSuccess,
  TResponseFailure,
  [key: TKey, offset: number],
  TGetParams,
  THandlers,
  TResponseManager
> {
  async makeRequest(
    key: TKey,
    offset: number,
    ...parameters: TCallParams
  ): Promise<TPayload> {
    let promise = this.pendingStore.get(key, offset)

    if (!promise) {
      promise = this.request(...parameters)
      this.pendingStore.set(key, promise)
    }

    try {
      return await promise
    } finally {
      this.pendingStore.delete(key)
    }
  }
}

export { ASCallDedumpedKeyedTimed }
