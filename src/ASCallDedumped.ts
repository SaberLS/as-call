import { ASDedumpedCallBase } from './ASCallDedumpedBase'
import { type PendingStore } from './ASCallDedumpedTypes'
import type { ExtraWithCall } from './ASCallTypes'
import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

class ASCallDedumped<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TPendingStore extends PendingStore<TPayload, undefined>,
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
> extends ASDedumpedCallBase<
  TPayload,
  TError,
  TCallParams,
  TPendingStore,
  TResponse,
  TResponseSuccess,
  TResponseFailure,
  [],
  TGetParams,
  THandlers
> {
  async makeRequest(...parameters: TCallParams): Promise<TPayload> {
    let promise = this.pendingStore.get()

    if (!promise) {
      promise = this.request(...parameters)
      this.pendingStore.set(promise)
    }

    try {
      return await promise
    } finally {
      this.pendingStore.delete()
    }
  }
}

export { ASCallDedumped }
