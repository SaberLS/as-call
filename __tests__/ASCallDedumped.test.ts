import { ASCallDedumped } from '../src/ASCall'
import { parseError } from '../src/core/parseError'
import type { ResponseManger } from '../src/response'
import { Response } from '../src/response/Response'
import { createResponseManager } from '../src/response/responseManager'

describe('ASCallDedumped primitive cases', () => {
  it('should dedump calls', async () => {
    let i = 0
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 500, i++))
    }
    let pending: Promise<void> | undefined

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: {
        get: () => pending,
        set: promise => {
          pending = promise
        },
        delete: () => (pending = undefined),
      },
      responseManager: createResponseManager<void, Error>(),
      parseError,
    })

    await Promise.all([dedumped.call(), dedumped.call()])

    expect(i).toBe(1)
  })

  it('should not dedump calls which are made one after another', async () => {
    let i = 0
    const testF = async () => {
      await new Promise(resolve => setTimeout(resolve, 500, i++))
    }
    let pending: Promise<void> | undefined

    const responseManager: ResponseManger<
      void,
      Error,
      Response<undefined, undefined, boolean>,
      Response<void, undefined, true>,
      Response<unknown, Error, false>
    > = {
      init(): Response<undefined, undefined, boolean> {
        return new Response(false, undefined, undefined)
      },

      succed(instance, payload) {
        return new Response(true, payload, undefined)
      },

      fail(instance, error) {
        return new Response(false, instance.getPayload(), error)
      },
    }

    const parseError = (error_: unknown): Error => {
      if (error_ instanceof Error) return error_

      return new Error('Unknown Error', { cause: error_ })
    }

    const dedumped = new ASCallDedumped(testF, {
      pendingStore: {
        get: () => pending,
        set: promise => {
          pending = promise
        },
        delete: () => (pending = undefined),
      },
      parseError,
      responseManager,
    })

    await dedumped.call()
    await dedumped.call()

    expect(i).toBe(2)
  })
})
