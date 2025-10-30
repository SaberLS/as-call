import { ASDedumpedCallBase } from './ASCallDedumpedBase'
import type { PendingStoreKeyed } from './ASCallDedumpedTypes'

import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

class ASCallDedumpedKeyed<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TPendingStore extends PendingStoreKeyed<TPayload, TKey>,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TKey,
  TGetParams extends unknown[] = TCallParams,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  > = Handlers<[response: TResponse], TResponseSuccess, TResponseFailure>,
> extends ASDedumpedCallBase<
  TPayload,
  TError,
  TCallParams,
  TPendingStore,
  TResponse,
  TResponseSuccess,
  TResponseFailure,
  [key: TKey],
  TGetParams,
  THandlers
> {
  async makeRequest(key: TKey, ...parameters: TCallParams): Promise<TPayload> {
    let promise = this.pendingStore.get(key)

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

export { ASCallDedumpedKeyed }

export { type PendingStoreKeyed } from './ASCallDedumpedTypes'
