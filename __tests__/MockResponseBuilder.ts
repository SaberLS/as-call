/* eslint-disable unicorn/consistent-function-scoping */ // arrow functions used inside jest.fn(...) trigger this error they need to be used inside to keep this binding
import { Response } from '../src/Response/Response'
import { BaseResponseBuilder } from '../src/ResponseBuilder/BaseResponseBuilder'

class MockResponseBuilder<
  TPayload,
  TError extends Error,
  TStart,
  TFailure extends Response<unknown, TError, false>,
  TSuccess extends Response<TPayload, undefined, true>,
> extends BaseResponseBuilder<TPayload, TError, TStart, TFailure, TSuccess> {
  start = jest.fn().mockReturnValue('start' as unknown as TStart)
  succed = jest.fn().mockReturnValue('succed' as unknown as TSuccess)
  fail = jest.fn().mockReturnValue('fail' as unknown as TFailure)

  init = jest.fn(() => super.init())

  // Wraps the real super method, but still mockable
  reset = jest.fn((...args: []) => super.reset(...args))
  setPayload = jest.fn((...args: [TPayload | undefined]) =>
    super.setPayload(...args)
  )
  setSuccess = jest.fn((...args: [boolean]) => super.setSuccess(...args))
  setError = jest.fn((...args: [TError | undefined]) => super.setError(...args))

  isSuccessfull = jest.fn(() => super.isSuccessfull())
  isInitialized = jest.fn(() => super.isInitialized())

  build = jest.fn(() => 'built' as unknown as TSuccess | TFailure)
}

export { MockResponseBuilder }
