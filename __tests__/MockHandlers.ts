import { Handlers } from '../src/Handlers'
import { Response } from '../src/Response/Response'

class MockHandlers<
  TStart,
  TSuccess extends Response<unknown, undefined, true>,
  TFailure extends Response<unknown, unknown, false>,
> extends Handlers<TStart, TSuccess, TFailure> {
  handleStart = jest.fn()
  handleSuccess = jest.fn()
  handleFailure = jest.fn()
  handleFinal = jest.fn()
}

export { MockHandlers }
