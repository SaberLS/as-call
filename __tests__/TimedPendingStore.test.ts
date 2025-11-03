/* eslint-disable @typescript-eslint/require-await */ // async functions are used to return promise from functions
import { PendingStoreTimedKeyed } from '../src/core'

describe('PendingStoreTimedKeyed', () => {
  let store: PendingStoreTimedKeyed<string, string>

  beforeEach(() => {
    jest.useFakeTimers()
    store = new PendingStoreTimedKeyed<string, string>()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns undefined if key is not found', () => {
    expect(store.get('missing', 1000)).toBeUndefined()
  })

  it('returns pending promise if present', async () => {
    const promise = Promise.resolve('pending-value')
    store.set('key1', promise)

    expect(store.get('key1', 1000)).toBe(promise)
  })

  it('returns resolved payload from succededMap if within offset', async () => {
    const promise = Promise.resolve('cached-value')
    store.set('key1', promise)

    await promise

    jest.advanceTimersByTime(500)

    const result = await store.get('key1', 1000)
    expect(result).toBe('cached-value')
  })

  it('does not return cached value after offset expires', async () => {
    const promise = Promise.resolve('expired-value')
    store.set('key1', promise)

    await promise
    jest.advanceTimersByTime(2000)

    store.delete('key1')
    expect(store.get('key1', 1000)).toBeUndefined()
  })

  it('deletes pending promise correctly', async () => {
    const promise = Promise.resolve('to-delete')
    store.set('key1', promise)

    store.delete('key1')
    expect(store.get('key1', 1000)).toBeUndefined()
  })

  it('moves resolved promise from pendingMap to succededMap', async () => {
    const promise = Promise.resolve('move-value')
    store.set('key1', promise)

    expect(store.pendingMap.has('key1')).toBe(true)
    await promise

    expect(store.pendingMap.has('key1')).toBe(true)
    expect(store.succededMap.has('key1')).toBe(true)
    expect(store.succededMap.get('key1')?.payload).toBe('move-value')
  })
})
