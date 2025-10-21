import { ResponseFailure, ResponseSuccess } from '../Response/Response'
import { BaseResponseBuilder } from './BaseResponseBuilder'

class ResponseBuilder<
  TPayload,
  TError extends Error,
> extends BaseResponseBuilder<
  TPayload,
  TError,
  ResponseFailure<TError>,
  ResponseSuccess<TPayload>
> {
  fail = () => {
    return new ResponseFailure<TError>(this.getPayload(), this.getError())
  }

  succed = () => {
    return new ResponseSuccess<TPayload>(this.getPayload())
  }
}

export { ResponseBuilder }
