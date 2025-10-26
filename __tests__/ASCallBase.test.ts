/* eslint-disable @typescript-eslint/require-await */ //async is used to return promises
import { TestASCall } from './TestASCall'

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
    expect(instance.handlers.onStart).toHaveBeenCalledWith('start')
    expect(instance.handlers.onSuccess).toHaveBeenCalledWith('succed')
    expect(instance.handlers.onFinal).toHaveBeenCalledWith('succed')

    // responseBuilder calls
    expect(instance.responseBuilder.setPayload).toHaveBeenCalledWith('sum:5')
    expect(instance.responseBuilder.setSuccess).toHaveBeenCalledWith(true)

    expect(result).toBe('succed')
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
    expect(instance.handlers.onFailure).toHaveBeenCalledWith('fail')
    expect(instance.handlers.onFinal).toHaveBeenCalledWith('fail')
    expect(result).toBe('fail')
  })

  it('should use getArgs if provided', async () => {
    const getArgsMock = jest.fn(async (x: string) => [Number(x), 10])

    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)

    // @ts-expect-error using mock adds wraps function with Mock<> function works correctly it's just a typing issue
    const instance = new TestASCall(requestMock, { getArgs: getArgsMock })
    const result = await instance.call('5')

    expect(getArgsMock).toHaveBeenCalledWith('5')
    expect(requestMock).toHaveBeenCalledWith(5, 10)
    expect(result).toBe('succed')
  })
})
