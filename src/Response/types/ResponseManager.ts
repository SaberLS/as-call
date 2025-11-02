import type { Response } from '../Response'

interface ResponseManger<
  TPayload,
  TError,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
> {
  init(): TResponse
  succed(instance: TResponse, payload: TPayload): TResponseSuccess

  fail(instance: TResponse | TResponseSuccess, error: TError): TResponseFailure
}

export type { ResponseManger }
