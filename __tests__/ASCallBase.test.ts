/* eslint-disable @typescript-eslint/require-await */ // async is used to return promises
import { ASCall } from '../src/ASCall'
import { parseError } from '../src/core'
import { createResponseManager } from '../src/response'
import { MockHandlers } from './MockHandlers'

describe('ASCallBase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handlers correctly on success', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const defaultHandlers = new MockHandlers()
    const instance = new ASCall(requestMock, {
      handlers: defaultHandlers,
      responseManager: createResponseManager<string, Error>(),
      parseError,
    })

    const result = await instance.call(2, 3)

    // getParameters
    expect(requestMock).toHaveBeenCalledWith(2, 3)

    // handler lifecycle
    expect(defaultHandlers.onStart).toHaveBeenCalled()
    expect(defaultHandlers.onSuccess).toHaveBeenCalled()
    expect(defaultHandlers.onFinal).toHaveBeenCalled()

    expect(defaultHandlers.onFailure).not.toHaveBeenCalled()

    expect(result.isSuccessfull()).toBe(true)
  })

  it('should handle error and call failure handlers', async () => {
    const error = new Error('boom')
    const requestMock = jest.fn(async () => {
      throw error
    })

    const defaultHandlers = new MockHandlers()

    const instance = new ASCall(requestMock, {
      handlers: defaultHandlers,
      responseManager: createResponseManager<never, Error>(),
      parseError,
    })

    await instance.call()

    expect(defaultHandlers.onFailure).toHaveBeenCalled()
    expect(defaultHandlers.onFinal).toHaveBeenCalled()
  })

  it('should use getArgs if provided', async () => {
    const getArgsMock = jest.fn(
      async (x: string): Promise<[a: number, b: number]> => [Number(x), 10]
    )

    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)

    const instance = new ASCall(requestMock, {
      getArgs: getArgsMock,
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })
    await instance.call('5')

    expect(getArgsMock).toHaveBeenCalledWith('5')
    expect(requestMock).toHaveBeenCalledWith(5, 10)
  })

  it('should use beforeCall if provided', async () => {
    const beforeCallMock = jest.fn((): void => {
      return
    })

    const requestMock = jest.fn(async () => 'requestMock')

    const instance = new ASCall(requestMock, {
      beforeCall: beforeCallMock,
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })
    await instance.call()

    expect(beforeCallMock).toHaveBeenCalled()
  })

  it('should pass arguments to beforeCall if provided', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const beforeCallMock = jest.fn((x: string): void => {
      return
    })

    const requestMock = jest.fn(async (x: string) => x)

    const instance = new ASCall(requestMock, {
      beforeCall: beforeCallMock,
      parseError,
      responseManager: createResponseManager<string, Error>(),
    })
    await instance.call('X')

    expect(beforeCallMock).toHaveBeenCalledWith('X')
  })
})
