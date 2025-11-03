import { parseError } from '../src/core'

describe('parseError', () => {
  it('returns error when given an Error', () => {
    const error = new Error('thrown')

    const parsed = parseError(error)

    expect(parsed).toBe(error)
  })

  it('returns error with cause which is the given argument when called with argument diffrent than Error', () => {
    const arr = [
      1,
      'str',
      {},
      [],
      () => {
        return
      },
      function () {
        return
      },
      undefined,
      void 2,
      BigInt('222'),
      true,
      false,
    ]

    for (const el of arr) {
      const parsed = parseError(el)
      expect(parsed).toBeInstanceOf(Error)
      expect(parsed.cause).toBe(el)
      expect(parsed.message).toBe('Unknown Error')
    }
  })
})
