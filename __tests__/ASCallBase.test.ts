/* eslint-disable @typescript-eslint/require-await */ //async is used to return promises
import { ASCallBase, type Options, type Reguest } from '../src/ASCallBase'
import { Response } from '../src/Response/Response'
import { MockHandlers } from './MockHandlers'
import { MockResponseBuilder } from './MockResponseBuilder'

// Create a simple concrete subclass for testing
class TestASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<
  TPayload, // TPayload
  TCallParams, // TCallParams
  Response<TPayload, undefined, true>, // TResponseSuccess
  Response<unknown, Error, false>, // TResponseFailure
  void,
  Error,
  TGetParams
> {
  readonly responseBuilder: MockResponseBuilder<
    TPayload,
    Error,
    undefined,
    Response<unknown, Error, false>,
    Response<TPayload, undefined, true>
  >
  readonly handlers: MockHandlers<
    void,
    Response<TPayload, undefined, true>,
    Response<unknown, Error, false>
  >

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<
      Options<TCallParams, TGetParams> & {
        handlers: ConstructorParameters<
          typeof MockHandlers<
            void,
            Response<TPayload, undefined, true>,
            Response<unknown, Error, false>
          >
        >['0']
      }
    >
  ) {
    super(request, { name: options?.name, getArgs: options?.getArgs })

    this.responseBuilder = new MockResponseBuilder(false)
    this.handlers = new MockHandlers(options?.handlers)
  }

  parseError(error_: unknown): Error {
    return error_ instanceof Error ? error_ : new Error(String(error_))
  }
}

describe('ASCallBase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handlers and responseBuilder correctly on success', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const instance = new TestASCall(requestMock)

    const result = await instance.call(2, 3)
    console.log(result)

    // getParameters
    expect(requestMock).toHaveBeenCalledWith(2, 3)

    // handler lifecycle
    expect(instance.handlers.handleStart).toHaveBeenCalledWith('start')
    expect(instance.handlers.handleSuccess).toHaveBeenCalledWith('succed')
    expect(instance.handlers.handleFinal).toHaveBeenCalledWith('built')

    // responseBuilder calls
    expect(instance.responseBuilder.setPayload).toHaveBeenCalledWith('sum:5')
    expect(instance.responseBuilder.setSuccess).toHaveBeenCalledWith(true)
    expect(instance.responseBuilder.build).toHaveBeenCalled()

    expect(result).toBe('built')
  })

  it('should handle error and call failure handlers', async () => {
    const error = new Error('boom')
    const requestMock = jest.fn(async () => {
      throw error
    })
    const instance = new TestASCall(requestMock)

    // Pretend isSuccessfull returns false after error
    instance.responseBuilder.isSuccessfull.mockReturnValue(false)

    const result = await instance.call()

    expect(instance.responseBuilder.setError).toHaveBeenCalledWith(error)
    expect(instance.handlers.handleFailure).toHaveBeenCalledWith('fail')
    expect(instance.handlers.handleFinal).toHaveBeenCalledWith('built')
    expect(result).toBe('built')
  })

  it('should use getArgs if provided', async () => {
    const getArgsMock = jest.fn(async (x: string) => [Number(x), 10])

    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)

    // @ts-expect-error using mock adds wraps function with Mock<> function works correctly it's just a typing issue
    const instance = new TestASCall(requestMock, { getArgs: getArgsMock })
    const result = await instance.call('5')

    expect(getArgsMock).toHaveBeenCalledWith('5')
    expect(requestMock).toHaveBeenCalledWith(5, 10)
    expect(result).toBe('built')
  })
})
