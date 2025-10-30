import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

abstract class ASCallBase<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TExtraParams extends unknown[] = [],
  TGetParams extends unknown[] = ExtraWithCall<TExtraParams, TCallParams>,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  > = Handlers<[response: TResponse], TResponseSuccess, TResponseFailure>,
  TResponseManager extends ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  > = ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  >,
> {
  readonly name: string
  readonly request: Request<TCallParams, TPayload>
  readonly handlers: Partial<THandlers> | undefined
  readonly parseError: (error_: unknown) => TError | Promise<TError>
  readonly getArgs?:
    | GetArgs<TGetParams, ExtraWithCall<TExtraParams, TCallParams>>
    | undefined

  readonly responseManager: ResponseManger<
    TPayload,
    TError,
    TResponse,
    TResponseSuccess,
    TResponseFailure
  >

  constructor(
    request: Request<TCallParams, TPayload>,
    options: Options<
      TPayload,
      TError,
      ExtraWithCall<TExtraParams, TCallParams>,
      TGetParams,
      TResponse,
      TResponseSuccess,
      TResponseFailure,
      THandlers,
      TResponseManager
    >
  ) {
    this.request = request
    this.responseManager = options.responseManager
    this.parseError = options.parseError

    this.name = options?.name ?? request.name
    this.handlers = options?.handlers
    this.getArgs = options?.getArgs
  }

  protected async tryStatement(
    response: TResponse,
    ...args: this['getArgs'] extends undefined ?
      ExtraWithCall<TExtraParams, TCallParams>
    : TGetParams
  ) {
    const parameters = await this.parseArguments(...args)
    const payload = await this.makeRequest(...parameters)

    return this.responseManager.succed(response, payload)
  }

  // Allows for full typesafety without passing parseArguments at instance declaration level
  protected async parseArguments(
    ...args: ConditionalParams<
      this['getArgs'],
      TExtraParams,
      TCallParams,
      TGetParams
    >
  ): Promise<ExtraWithCall<TExtraParams, TCallParams>> {
    // These casts are safe because the ternary condition mirrors the same conditional type logic used in the type of ...args.
    // - If getArgs is undefined, args already match ConditionalParams<TExtraParams, TCallParams>
    // - Otherwise, getArgs(...args) produces that same shape.
    const parameters =
      this.getArgs === undefined ?
        (args as ExtraWithCall<TExtraParams, TCallParams>)
      : await this.getArgs(...(args as TGetParams))

    return parameters
  }

  abstract makeRequest(
    ...parameters: ExtraWithCall<TExtraParams, TCallParams>
  ): Promise<TPayload>
  // {
  //   const payload = await this.request(...parameters)
  //   return payload
  // }

  async catchStatement(
    instance: TResponse | TResponseSuccess,
    error_: unknown
  ) {
    const error = await this.parseError(error_)

    return this.responseManager.fail(instance, error)
  }

  finalStatement(response: TResponseFailure | TResponseSuccess) {
    return response
  }

  call(
    ...args: ConditionalParams<
      this['getArgs'],
      TExtraParams,
      TCallParams,
      TGetParams
    >
  ) {
    return this.callWithOptions(undefined, ...args)
  }

  async callWithOptions(
    handlers?: Partial<THandlers>,
    ...args: ConditionalParams<
      this['getArgs'],
      TExtraParams,
      TCallParams,
      TGetParams
    >
  ) {
    const mergedHandlers = { ...this.handlers, ...handlers }
    let response: TResponse | TResponseFailure | TResponseSuccess =
      this.responseManager.init()
    mergedHandlers.onStart?.(response)

    try {
      response = await this.tryStatement?.(response, ...args)
      mergedHandlers.onSuccess?.(response)
    } catch (error_: unknown) {
      response = await this.catchStatement(response, error_)
      mergedHandlers.onFailure?.(response)
    } finally {
      mergedHandlers.onFinal?.(
        this.finalStatement(response as TResponseFailure | TResponseSuccess)
      )
    }

    return response
  }
}

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

export { ASCallBase }
export type {
  ConditionalParams,
  ExtraWithCall,
  GetArgs,
  Options,
  Request,
  ResponseManger,
}
