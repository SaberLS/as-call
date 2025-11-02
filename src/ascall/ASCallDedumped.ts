import { ASDedumpedCallBase, type Handlers, type PendingStore } from '../core'
import type { Response } from '../response'

class ASCallDedumped<
  TPayload,
  TError extends Error,
  TCallParams extends [],
  TPendingStore extends PendingStore<TPayload>,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
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
