import type {
  Options as ASCallBaseOptions,
  ResponseManger,
} from './ASCallTypes'
import type { Handlers } from './Handlers'
import type { Response } from './Response/Response'

interface PendingStore<TPayload, TKey = undefined> {
  get(
    ...args: TKey extends undefined ? [] : [key: TKey]
  ): Promise<TPayload> | undefined
  set(
    ...args: TKey extends undefined ? [promise: Promise<TPayload>]
    : [key: TKey, promise: Promise<TPayload>]
  ): void
  delete(...args: TKey extends undefined ? [] : [key: TKey]): void
}

interface Options<
  TPayload,
  TError,
  TCallParams extends unknown[],
  TPendingStore extends PendingStore<TPayload, unknown>,
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

interface PendingStoreKeyed<TPayload, TKey> {
  get(key: TKey): Promise<TPayload> | undefined
  set(key: TKey, promise: Promise<TPayload>): void
  delete(key: TKey): void
}

export type { Options, PendingStore, PendingStoreKeyed }
