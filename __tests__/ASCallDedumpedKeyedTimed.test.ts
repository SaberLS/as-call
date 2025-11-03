import { ASCallDedumpedKeyedTimed } from '../src/ASCall'
import { parseError, PendingStoreTimedKeyed } from '../src/core'
import { createResponseManager } from '../src/response'

describe('ASCallDedumpedKeyedTimed timing and caching behavior', () => {
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

  it('should dedump simultaneous calls with same key', async () => {
    let count = 0
    const testF = async (key: string) => {
      count++
      await new Promise(res => setTimeout(res, 50))
      return `${key}-${count}`
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<string, string>(),
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })

    const p1 = dedumped.call('alpha', 1000, 'alpha')
    await advance(5)
    const p2 = dedumped.call('alpha', 1000, 'alpha')

    await advance(50)

    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1.getPayload()).toBe('alpha-1')
    expect(r2.getPayload()).toBe('alpha-1')
    expect(count).toBe(1)
  })

  it('should NOT dedump calls with different keys', async () => {
    let count = 0
    const testF = async (key: string) => {
      count++
      await new Promise(res => setTimeout(res, 50))
      return `${key}-${count}`
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<string, string>(),
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })

    const p1 = dedumped.call('alpha', 1000, 'alpha')
    await advance(50)

    const p2 = dedumped.call('beta', 1000, 'beta')
    await advance(50)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1.getPayload()).toBe('alpha-1')
    expect(r2.getPayload()).toBe('beta-2')
    expect(count).toBe(2)
  })

  it('should reuse previous successful result if within offset window', async () => {
    let count = 0
    const testF = async (key: string) => {
      count++
      await new Promise(res => setTimeout(res, 20))
      return `${key}-${count}`
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<string, string>(),
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })

    const first = dedumped.call('alpha', 1000, 'alpha')
    await advance(20)
    const r1 = await first

    // call again right after (within offset)
    const second = dedumped.call('alpha', 1000, 'alpha')
    const r2 = await second

    expect(r1.getPayload()).toBe('alpha-1')
    expect(r2.getPayload()).toBe('alpha-1')
    expect(count).toBe(1)
  })

  it('should expire cached result after offset passes', async () => {
    let count = 0
    const testF = async (key: string) => {
      count++
      await new Promise(res => setTimeout(res, 10))
      return `${key}-${count}`
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<string, string>(),
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })

    const first = dedumped.call('alpha', 100, 'alpha')
    await advance(10)
    await first

    // within offset -> reused
    const second = dedumped.call('alpha', 100, 'alpha')
    const r2 = await second
    expect(r2.getPayload()).toBe('alpha-1')

    // advance beyond offset -> cache expired
    await advance(200)
    const third = dedumped.call('alpha', 100, 'alpha')
    await advance(10)
    const r3 = await third

    expect(r3.getPayload()).toBe('alpha-2')
    expect(count).toBe(2)
  })

  it('should dedump overlapping calls and handle one failure gracefully', async () => {
    let callCount = 0
    const testF = async (key: string) => {
      callCount++
      await new Promise(res => setTimeout(res, 10))
      throw new Error(`boom-${key}`)
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<never, string>(),
      parseError,
      responseManager: createResponseManager<never, Error>(),
    })

    const p1 = dedumped.call('alpha', 500, 'alpha')
    const p2 = dedumped.call('alpha', 500, 'alpha')

    await advance(15)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1.isSuccessfull()).toBe(false)
    expect(r2.isSuccessfull()).toBe(false)

    expect(r1.getError()?.message).toBe('boom-alpha')
    expect(r2.getError()?.message).toBe('boom-alpha')

    expect(callCount).toBe(1)
  })

  it('should cache successful result and still allow new keys to work independently', async () => {
    let count = 0
    const testF = async (key: string) => {
      count++
      await new Promise(res => setTimeout(res, 10))
      return `${key}-${count}`
    }

    const dedumped = new ASCallDedumpedKeyedTimed(testF, {
      pendingStore: new PendingStoreTimedKeyed<string, string>(),
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })

    const a = dedumped.call('a', 1000, 'a')
    await advance(10)
    const ra = await a

    const b = dedumped.call('b', 1000, 'b')
    await advance(10)

    const rb = await b
    await advance(10)
    expect(ra.getPayload()).toBe('a-1')
    expect(rb.getPayload()).toBe('b-2')

    // within offset → cached reuse for key 'a'
    const a2 = dedumped.call('a', 1000, 'a')
    const ra2 = await a2
    expect(ra2.getPayload()).toBe('a-1')
    expect(count).toBe(2)
  })
})
