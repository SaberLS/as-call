import { ASCall } from '../src/ASCall'
import { parseError } from '../src/core'
import { createResponseManager } from '../src/response'

describe('ASCallBase constructor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use function name if name is not given', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const funcName = () => Promise.resolve(1)

    const instance = new ASCall(funcName, {
      parseError,
      responseManager: createResponseManager<number, Error>(),
    })

    expect(instance.name).toBe('funcName')
  })
})
