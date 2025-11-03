import { ASCallDedumped } from '../src/ASCall'
import { parseError, PendingStoreSimple } from '../src/core'
import { createResponseManager } from '../src/response'

describe('ASCallDedumped timing and race condition cases', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const advance = async (ms: number) => {
    await jest.advanceTimersByTimeAsync(ms)
  }

  it('should dedump calls that start almost simultaneously', async () => {
    let count = 0
    const testF = async () => {
      count++
      await new Promise(res => setTimeout(res, 50))
      return count
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: new PendingStoreSimple<number>(),
      responseManager: createResponseManager<number, Error>(),
      parseError,
    })

    const p1 = dedumped.call()
    await advance(5)
    const p2 = dedumped.call()

    await advance(50)

    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1.getPayload()).toBe(1)
    expect(r2.getPayload()).toBe(1)
    expect(count).toBe(1)
  })

  it('should not dedump if a new call starts after the previous one finished', async () => {
    let count = 0
    const testF = async () => {
      count++
      await new Promise(res => setTimeout(res, 30))
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: new PendingStoreSimple<void>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    const p1 = dedumped.call()
    await advance(30)
    await p1

    const p2 = dedumped.call()
    await advance(30)
    await p2

    expect(count).toBe(2)
  })

  it('should dedump overlapping calls but not calls made after resolution', async () => {
    let count = 0
    const testF = async () => {
      count++
      await new Promise(res => setTimeout(res, 40))
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: new PendingStoreSimple<void>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    const p1 = dedumped.call()
    await advance(10)
    const p2 = dedumped.call()
    await advance(40)
    await Promise.all([p1, p2])

    // after both done, new call should trigger again
    const p3 = dedumped.call()
    await advance(40)
    await p3

    expect(count).toBe(2)
  })

  it('should correctly dedump when a call resolves and another starts right after', async () => {
    let count = 0
    const testF = async () => {
      count++
      await new Promise(res => setTimeout(res, 20))
      return count
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: new PendingStoreSimple<number>(),
      parseError,
      responseManager: createResponseManager<number, Error>(),
    })

    const first = dedumped.call()
    await advance(25)
    await first

    const second = dedumped.call()
    await advance(25)
    await second

    expect(count).toBe(2)
  })

  it('should dedump overlapping calls and handle one failure gracefully', async () => {
    let callCount = 0
    const testF = async () => {
      callCount++
      await new Promise(res => setTimeout(res, 10))
      throw new Error('boom')
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: new PendingStoreSimple<void>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    const p1 = dedumped.call()
    const p2 = dedumped.call()

    await advance(20)

    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1.isSuccessfull()).toBe(false)
    expect(r2.isSuccessfull()).toBe(false)
    expect(callCount).toBe(1)
  })

  it('should clear pending promise after rejection', async () => {
    const testF = async () => {
      await new Promise(res => setTimeout(res, 10))
      throw new Error('fail')
    }

    const pendingStore = new PendingStoreSimple<void>()
    const dedumped = new ASCallDedumped(testF, {
      pendingStore,
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    const p = dedumped.call()
    await advance(10)

    const r = await p
    expect(r.isSuccessfull()).toBe(false)
    expect(pendingStore.get()).toBeUndefined()
  })
})
