/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable unicorn/consistent-function-scoping */
import { ASCall } from '../src/ASCall'
import { parseError } from '../src/core'
import { createResponseManager } from '../src/response'

describe('Primitive cases', () => {
  it('should return promise payload in ResponseSuccess', async () => {
    const t = async () => {
      return 1
    }

    const parseError = (error_: unknown): Error => {
      if (error_ instanceof Error) return error_

      return new Error('Unknown Error', { cause: error_ })
    }

    const asc = new ASCall(t, {
      responseManager: createResponseManager<number, Error>(),
      parseError,
    })

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

    const asc = new ASCall(t, {
      responseManager: createResponseManager<number, Error>(),
      parseError,
    })

    const res = await asc.call()

    expect(res.getPayload()).toBe(undefined)
    expect(res.getError()).toBe(error)
    expect(res.isSuccessfull()).toBe(false)
  })
})
