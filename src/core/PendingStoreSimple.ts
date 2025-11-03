import type { PendingStore } from './types'

class PendingStoreSimple<TPayload> implements PendingStore<TPayload> {
  promise: Promise<TPayload> | undefined

  get(): Promise<TPayload> | undefined {
    return this.promise
  }

  set(promise: Promise<TPayload>): void {
    this.promise = promise
  }

  delete(): void {
    this.promise = undefined
  }
}

export { PendingStoreSimple }
