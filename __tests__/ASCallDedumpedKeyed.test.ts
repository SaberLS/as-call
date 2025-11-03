import { ASCallDedumpedKeyed } from '../src/ASCall'
import { parseError } from '../src/core'
import { createResponseManager } from '../src/response'

describe('ASCallDedumpedKeyed primitive cases', () => {
  it('should dedump calls', async () => {
    let i = 0
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      i++
    }

    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore: new Map<number, Promise<void>>(),
      responseManager: createResponseManager<void, Error>(),
      parseError,
    })

    await Promise.all([dedumped.call(7), dedumped.call(7)])

    expect(i).toBe(1)
  })

  it('should not dedump calls which are made one after another', async () => {
    let i = 0
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      i++
    }

    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore: new Map<number, Promise<void>>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    await dedumped.call(1)
    await dedumped.call(1)

    expect(i).toBe(2)
  })

  it('should not dedump calls with different keys', async () => {
    let i = 0
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      i++
    }

    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore: new Map<number, Promise<void>>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    await Promise.all([dedumped.call(1), dedumped.call(2)])

    expect(i).toBe(2)
  })

  it('should clear pending entry after resolution', async () => {
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const pendingStore = new Map<number, Promise<void>>()
    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore,
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    await dedumped.call(123)
    expect(pendingStore.has(123)).toBe(false)
  })

  it('should propagate rejections and clear pending key', async () => {
    const error = new Error('fail')
    const testF = () => {
      throw error
    }

    const pendingStore = new Map<number, Promise<never>>()
    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore,
      parseError,
      responseManager: createResponseManager<never, Error>(),
    })

    const res = await dedumped.call(9)
    expect(res.isSuccessfull()).toBe(false)
    expect(pendingStore.has(9)).toBe(false)
  })

  it('should dedump multiple simultaneous calls with mixed keys', async () => {
    const calls: number[] = []
    const testF = async (x: number) => {
      calls.push(x)
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore: new Map<number, Promise<void>>(),
      parseError,
      responseManager: createResponseManager<void, Error>(),
    })

    await Promise.all([
      dedumped.call(1, 1),
      dedumped.call(1, 1),
      dedumped.call(2, 2),
      dedumped.call(2, 2),
      dedumped.call(3, 3),
    ])

    // should execute 3 unique keys
    expect(calls.sort()).toEqual([1, 2, 3])
  })

  it('should handle async return values properly', async () => {
    const testF = async (key: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return key * 2
    }

    const dedumped = new ASCallDedumpedKeyed(testF, {
      pendingStore: new Map<number, Promise<number>>(),
      parseError,
      responseManager: createResponseManager<number, Error>(),
    })

    const result = await Promise.all([dedumped.call(5, 5), dedumped.call(5, 5)])

    expect(result[0].getPayload()).toBe(10)
    expect(result[1].getPayload()).toBe(result[0].getPayload())
  })
})
