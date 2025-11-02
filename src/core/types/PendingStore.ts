interface PendingStoreBase<TPayload> {
  get(...args: unknown[]): Promise<TPayload> | undefined
  set(...args: unknown[]): void
  delete(...args: unknown[]): void
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
  PendingStore,
  PendingStoreBase,
  PendingStoreKeyed,
  PendingStoreKeyedTimed,
}
