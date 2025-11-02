import type { PendingStoreKeyedTimed } from './ASCallDedumpedTypes'

class PendingStoreTimedKeyed<TPayload, TKey>
  implements PendingStoreKeyedTimed<TPayload, TKey>
{
  pendingMap = new Map<TKey, Promise<TPayload>>()
  succededMap = new Map<TKey, { payload: TPayload; timestamp: number }>()

  get(key: TKey, offset: number): Promise<TPayload> | undefined {
    const pending = this.pendingMap.get(key)

    if (pending !== undefined) return pending

    const succeded = this.succededMap.get(key)

    if (succeded !== undefined && Date.now() - succeded.timestamp < offset)
      return Promise.resolve(succeded.payload)

    return
  }

  set(key: TKey, promise: Promise<TPayload>): void {
    this.pendingMap.set(key, promise)
    void promise.then(r =>
      this.succededMap.set(key, { payload: r, timestamp: Date.now() })
    )
  }

  delete(key: TKey): void {
    this.pendingMap.delete(key)
  }
}

export { PendingStoreTimedKeyed }
