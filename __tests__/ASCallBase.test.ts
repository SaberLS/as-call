/* eslint-disable @typescript-eslint/require-await */ // async is used to return promises
import { MockHandlers } from './MockHandlers'
import { TestASCall } from './TestASCall'

describe('ASCallBase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handlers correctly on success', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const defaultHandlers = new MockHandlers()
    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    const result = await instance.call(2, 3)
    console.log(result)

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
    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    const result = await instance.call()
    expect(instance.call).toHaveBeenCalled()

    expect(defaultHandlers.onFailure).toHaveBeenCalled()
    expect(defaultHandlers.onFinal).toHaveBeenCalled()

    expect(result.isSuccessfull()).toBe(false)
  })

  it('should use getArgs if provided', async () => {
    const getArgsMock = jest.fn(async (x: string) => [Number(x), 10])
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)

    // @ts-expect-error using mock adds wraps function with Mock<> function works correctly it's just a typing issue
    const instance = new TestASCall(requestMock, { getArgs: getArgsMock })
    const result = await instance.call('5')

    expect(getArgsMock).toHaveBeenCalledWith('5')
    expect(requestMock).toHaveBeenCalledWith(5, 10)
    expect(result.isSuccessfull()).toBe(true)
  })
})
