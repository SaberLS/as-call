import type { Response, ResponseManger } from '../../response'
import type { GetArgs } from '../../types'
import type { Handlers } from './Handlers'

interface ASCallBaseOptions<
  TPayload,
  TError,
  TExtraWithCall extends unknown[],
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
  getArgs?: GetArgs<TGetParams, TExtraWithCall>
  handlers?: Partial<THandlers>
  responseManager: TResponseManager
  beforeCall?: (...args: TExtraWithCall) => void | Promise<void>
  parseError: (error_: unknown) => TError | Promise<TError>
}

export type { ASCallBaseOptions }
