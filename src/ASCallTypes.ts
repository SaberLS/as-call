import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

type ConditionalParams<
  TGetArgs,
  TExtraParams extends unknown[],
  TCallParams extends unknown[],
  TGetParams extends unknown[],
> =
  TGetArgs extends undefined ? ExtraWithCall<TExtraParams, TCallParams>
  : TGetParams

/**
 * if TExtraParams are [] use TCallParams type
 * else [...TExtraParams, ...TCallParams]
 */
type ExtraWithCall<
  TExtraParams extends unknown[],
  TCallParams extends unknown[],
> = TExtraParams extends [] ? TCallParams : [...TExtraParams, ...TCallParams]

type GetArgs<TParams extends unknown[], TCallParams extends unknown[]> =
  | ((...args: TParams) => TCallParams)
  | ((...args: TParams) => Promise<TCallParams>)

type Request<TCallParams extends unknown[], TPayload> = (
  ...args: TCallParams
) => Promise<TPayload>

interface Options<
  TPayload,
  TError,
  TCallParams extends unknown[],
  TGetParams extends unknown[],
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  >,
  TResponseManager extends ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  >,
> {
  name?: string
  getArgs?: GetArgs<TGetParams, TCallParams>
  handlers?: Partial<THandlers>
  responseManager: TResponseManager
  parseError: (error_: unknown) => TError | Promise<TError>
}

interface ResponseManger<
  TPayload,
  TError,
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
> {
  init(): TResponse
  succed<T extends Response<unknown, unknown, boolean>>(
    instance: T,
    payload: TPayload
  ): TResponseSuccess

  fail<T extends TResponse | TResponseSuccess>(
    instance: T,
    error: TError
  ): TResponseFailure
}

export type {
  ConditionalParams,
  ExtraWithCall,
  GetArgs,
  Options,
  Request,
  ResponseManger,
}
