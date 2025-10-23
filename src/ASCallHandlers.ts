import { Handlers } from './Handlers'
import { ResponseFailure, ResponseSuccess } from './Response/Response'

class ASCallHandlers<TPayload, TError extends Error> extends Handlers<
  TPayload,
  TError,
  (
    ...args: ConstructorParameters<typeof ResponseSuccess<TPayload>>
  ) => ResponseSuccess<TPayload>,
  (
    ...args: ConstructorParameters<typeof ResponseFailure<TError>>
  ) => ResponseFailure<TError>,
  ResponseSuccess<TPayload>,
  ResponseFailure<TError>
> {
  protected buildSuccessResult = (payload: TPayload) => {
    return new ResponseSuccess(payload)
  }

  protected buildFailureResult = (payload: unknown, error: TError) => {
    return new ResponseFailure(payload, error)
  }
}

export { ASCallHandlers }
