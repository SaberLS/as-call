import { Response, ResponseTimestamped } from '../src/response'

describe('Response', () => {
  it('stores and returns payload, error, and success state', () => {
    const payload = { data: 'ok' }
    // eslint-disable-next-line unicorn/no-null
    const error = null
    const response = new Response(true, payload, error)

    expect(response.getPayload()).toBe(payload)
    expect(response.getError()).toBe(error)
    expect(response.isSuccessfull()).toBe(true)
  })

  it('handles failure case correctly', () => {
    const payload = undefined
    const error = new Error('failure')
    const response = new Response(false, payload, error)

    expect(response.getPayload()).toBeUndefined()
    expect(response.getError()).toBe(error)
    expect(response.isSuccessfull()).toBe(false)
  })
})

describe('ResponseTimestamped', () => {
  it('inherits Response and adds timestamp', () => {
    const payload = 'data'
    const error = undefined
    const success = true
    const fixedTimestamp = 1_720_000_000_000

    const response = new ResponseTimestamped(
      success,
      payload,
      error,
      fixedTimestamp
    )

    expect(response.getPayload()).toBe(payload)
    expect(response.getError()).toBe(error)
    expect(response.isSuccessfull()).toBe(true)
    expect(response.getTimestamp()).toBe(fixedTimestamp)
  })

  it('defaults timestamp to Date.now()', () => {
    const payload = 123
    // eslint-disable-next-line unicorn/no-null
    const error = null
    const success = true

    // Fake Date.now() to control timestamp value
    const fakeNow = 999_999_999_999
    const spy = jest.spyOn(Date, 'now').mockReturnValue(fakeNow)

    const response = new ResponseTimestamped(success, payload, error)

    expect(response.getTimestamp()).toBe(fakeNow)
    expect(response.getPayload()).toBe(payload)
    expect(response.isSuccessfull()).toBe(true)

    spy.mockRestore()
  })

  it('works correctly with falsy payloads and errors', () => {
    const response = new ResponseTimestamped(false, 0, '', 123_456)
    expect(response.getPayload()).toBe(0)
    expect(response.getError()).toBe('')
    expect(response.isSuccessfull()).toBe(false)
    expect(response.getTimestamp()).toBe(123_456)
  })
})
