import { Handlers } from '../src/Handlers'
import { Response } from '../src/Response/Response'

class MockHandlers<
  TStart,
  TSuccess extends Response<unknown, undefined, true>,
  TFailure extends Response<unknown, unknown, false>,
> extends Handlers<TStart, TSuccess, TFailure> {
  onStart = jest.fn()
  onSuccess = jest.fn()
  onFailure = jest.fn()
  onFinal = jest.fn()
}

export { MockHandlers }
