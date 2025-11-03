import { Response } from './Response'
import type { ResponseManger } from './types'

const createResponseManager = <TPayload, TError>(): ResponseManger<
  TPayload,
  TError,
  Response<undefined, undefined, boolean>,
  Response<TPayload, undefined, true>,
  Response<unknown, TError, false>
> => {
  return {
    init() {
      return new Response(false, undefined, undefined)
    },
    succed(_instance, payload) {
      return new Response(true, payload, undefined)
    },
    fail(instance, error) {
      return new Response(false, instance.getPayload(), error)
    },
  }
}

export { createResponseManager }
