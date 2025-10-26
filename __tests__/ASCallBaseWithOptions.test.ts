/* eslint-disable @typescript-eslint/require-await */ //async is used to return promises
import { TestASCall } from './TestASCall'

describe('ASCallBase.callWithOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses default handlers when no overrides are passed', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const instance = new TestASCall(requestMock)

    const response = await instance.callWithOptions(undefined, 1, 2)

    // Default handler invocations
    expect(instance.handlers.onStart).toHaveBeenCalledWith('start')
    expect(instance.handlers.onSuccess).toHaveBeenCalledWith('succed')
    expect(instance.handlers.onFinal).toHaveBeenCalledWith('succed')

    // Verify that overrides were NOT called (none passed)
    expect(requestMock).toHaveBeenCalledWith(1, 2)
    expect(response).toBe('succed')
  })

  it('prefers custom handlers over default ones', async () => {
    const requestMock = jest.fn(async (x: string) => `hi:${x}`)
    const instance = new TestASCall(requestMock)

    const custom = {
      onStart: jest.fn(),
      onSuccess: jest.fn(),
      onFinal: jest.fn(),
    }

    const response = await instance.callWithOptions(custom, 'A')

    // Verify custom handlers used
    expect(custom.onStart).toHaveBeenCalledWith('start')
    expect(custom.onSuccess).toHaveBeenCalledWith('succed')
    expect(custom.onFinal).toHaveBeenCalledWith('succed')

    // Verify defaults not called
    expect(instance.handlers.onStart).not.toHaveBeenCalled()
    expect(instance.handlers.onSuccess).not.toHaveBeenCalled()
    expect(instance.handlers.onFinal).not.toHaveBeenCalled()

    expect(response).toBe('succed')
  })

  it('invokes custom onFailure/onFinal in error case', async () => {
    const error = new Error('boom')
    const requestMock = jest.fn(async () => {
      throw error
    })
    const instance = new TestASCall(requestMock)
    instance.responseBuilder.isSuccessfull.mockReturnValue(false)

    const custom = {
      onFailure: jest.fn(),
      onFinal: jest.fn(),
    }

    // @ts-expect-error Expected 0-1 arguments, but got 3.ts(2554) passing wrong amount of arguments is part of the test
    const response = await instance.callWithOptions(custom, 1, 2)

    // Custom failure handler
    expect(custom.onFailure).toHaveBeenCalledWith('fail')
    expect(custom.onFinal).toHaveBeenCalledWith('fail')

    // Default handlers unused
    expect(instance.handlers.onFailure).not.toHaveBeenCalled()
    expect(instance.handlers.onFinal).not.toHaveBeenCalled()

    expect(response).toBe('fail')
  })

  it('falls back to class-level handlers when custom ones missing', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const instance = new TestASCall(requestMock)

    const partial = {
      onStart: jest.fn(),
      // no onSuccess or onFinal provided
    }

    await instance.callWithOptions(partial, 2, 3)

    // custom onStart called
    expect(partial.onStart).toHaveBeenCalledWith('start')

    // default handlers used for missing ones
    expect(instance.handlers.onSuccess).toHaveBeenCalledWith('succed')
    expect(instance.handlers.onFinal).toHaveBeenCalledWith('succed')
  })
})
