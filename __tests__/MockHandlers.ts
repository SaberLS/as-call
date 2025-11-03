import type { Handlers } from '../src/core'
import { Response } from '../src/response'

class MockHandlers<
  TStart extends unknown[],
  TSuccess extends Response<unknown, undefined, true>,
  TFailure extends Response<unknown, unknown, false>,
> implements Handlers<TStart, TSuccess, TFailure>
{
  onStart = jest.fn()
  onSuccess = jest.fn()
  onFailure = jest.fn()
  onFinal = jest.fn()
}

export { MockHandlers }
