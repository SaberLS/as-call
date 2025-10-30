/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable unicorn/consistent-function-scoping */
import { ASCall } from '../src/ASCall'
import type { ResponseManger } from '../src/ASCallTypes'
import { Response } from '../src/Response/Response'

describe('Primitive cases', () => {
  it('should return promise payload in ResponseSuccess', async () => {
    const t = async () => {
      return 1
    }

    const responseManager: ResponseManger<
      number,
      Error,
      Response<undefined, undefined, boolean>,
      Response<number, undefined, true>,
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

    const asc = new ASCall(t, { responseManager, parseError })

    const res = await asc.call()

    expect(res.getPayload()).toBe(1)
    expect(res.getError()).toBe(undefined)
    expect(res.isSuccessfull()).toBe(true)
  })

  it('should return Error in promise ResponseFailure', async () => {
    const error = new Error('error')
    const t = () => {
      throw error
    }

    const responseManager: ResponseManger<
      number,
      Error,
      Response<undefined, undefined, boolean>,
      Response<number, undefined, true>,
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

    const asc = new ASCall(t, { responseManager, parseError })

    const res = await asc.call()

    expect(res.getPayload()).toBe(undefined)
    expect(res.getError()).toBe(error)
    expect(res.isSuccessfull()).toBe(false)
  })
})
