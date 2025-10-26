import { Response } from '../Response/Response'
import { BaseResponseBuilder } from './BaseResponseBuilder'

class ResponseBuilder<
  TPayload,
  TError extends Error,
> extends BaseResponseBuilder<
  TPayload,
  TError,
  void,
  Response<unknown, TError, false>,
  Response<TPayload, undefined, true>
> {
  start = () => {
    return
  }

  fail = () => {
    return new Response<unknown, TError, false>(
      false,
      this.getPayload(),
      this.getError()
    )
  }

  succed = () => {
    return new Response<TPayload, undefined, true>(true, this.getPayload())
  }
}

export { ResponseBuilder }
