/* eslint-disable @typescript-eslint/require-await */ //async is used to return promises
import { MockHandlers } from './MockHandlers'
import { TestASCall } from './TestASCall'

describe('ASCallBase.callWithOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses default handlers when no overrides are passed', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => {
      return `sum:${a + b}`
    })

    const defaultHandlers = new MockHandlers()
    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    await instance.call(1, 2)

    // Default handler invocations
    expect(defaultHandlers.onStart).toHaveBeenCalled()
    expect(defaultHandlers.onSuccess).toHaveBeenCalled()
    expect(defaultHandlers.onFinal).toHaveBeenCalled()

    // Verify that overrides were NOT called (none passed)
    expect(requestMock).toHaveBeenCalledWith(1, 2)
  })

  it('prefers custom handlers over default ones', async () => {
    const requestMock = jest.fn(async (x: string) => `hi:${x}`)
    const defaultHandlers = new MockHandlers()
    const customHandlers = new MockHandlers()

    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    await instance.callWithOptions(customHandlers, 'A')

    // Verify custom handlers used
    expect(customHandlers.onStart).toHaveBeenCalled()
    expect(customHandlers.onSuccess).toHaveBeenCalled()
    expect(customHandlers.onFinal).toHaveBeenCalled()

    // Verify defaults not called
    expect(defaultHandlers.onStart).not.toHaveBeenCalled()
    expect(defaultHandlers.onSuccess).not.toHaveBeenCalled()
    expect(defaultHandlers.onFinal).not.toHaveBeenCalled()
  })

  it('invokes custom onFailure/onFinal in error case', async () => {
    const error = new Error('boom')
    const requestMock = jest.fn(async () => {
      throw error
    })
    const defaultHandlers = new MockHandlers()
    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    const customHandlers = {
      onFailure: jest.fn(),
      onFinal: jest.fn(),
    }

    // @ts-expect-error Expected 0-1 arguments, but got 3.ts(2554) passing wrong amount of arguments is part of the test
    await instance.callWithOptions(customHandlers, 1, 2)

    // Custom failure handler
    expect(customHandlers.onFailure).toHaveBeenCalled()
    expect(customHandlers.onFinal).toHaveBeenCalled()

    // Default handlers unused
    expect(defaultHandlers.onFailure).not.toHaveBeenCalled()
    expect(defaultHandlers.onFinal).not.toHaveBeenCalled()
  })

  it('falls back to default handlers when custom ones missing', async () => {
    const requestMock = jest.fn(async (a: number, b: number) => `sum:${a + b}`)
    const defaultHandlers = new MockHandlers()
    const instance = new TestASCall(requestMock, { handlers: defaultHandlers })

    const partial = {
      onStart: jest.fn(),
      // no onSuccess or onFinal provided
    }

    await instance.callWithOptions(partial, 2, 3)

    // custom onStart called
    expect(partial.onStart).toHaveBeenCalled()

    // default handlers used for missing ones
    expect(defaultHandlers.onSuccess).toHaveBeenCalled()
    expect(defaultHandlers.onFinal).toHaveBeenCalled()
  })
})
