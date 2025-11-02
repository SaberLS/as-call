import type {
  Options as ASCallBaseOptions,
  ResponseManger,
} from './ASCallTypes'
import type { Handlers } from './Handlers'
import type { Response } from './Response/Response'

interface PendingStoreBase<TPayload> {
  get(...args: unknown[]): Promise<TPayload> | undefined
  set(...args: unknown[]): void
  delete(...args: unknown[]): void
}

interface Options<
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

interface PendingStore<TPayload> extends PendingStoreBase<TPayload> {
  get(): Promise<TPayload> | undefined
  set(promise: Promise<TPayload>): void
  delete(): void
}

interface PendingStoreKeyed<TPayload, TKey> extends PendingStoreBase<TPayload> {
  get(key: TKey): Promise<TPayload> | undefined
  set(key: TKey, promise: Promise<TPayload>): void
  delete(key: TKey): void
}

interface PendingStoreKeyedTimed<TPayload, TKey>
  extends PendingStoreBase<TPayload> {
  get(key: TKey, offset: number): Promise<TPayload> | undefined
  set(key: TKey, promise: Promise<TPayload>): void
  delete(key: TKey): void
}

export type {
  Options,
  PendingStore,
  PendingStoreBase,
  PendingStoreKeyed,
  PendingStoreKeyedTimed,
}
