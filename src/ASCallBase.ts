import type {
  ExtraWithCall,
  GetArgs,
  Options,
  Request,
  ResponseManger,
} from './ASCallTypes'
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
  readonly beforeCall?: (
    ...args: ExtraWithCall<TExtraParams, TCallParams>
  ) => void | Promise<void>

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
    this.beforeCall = options?.beforeCall
  }

  protected async tryStatement(response: TResponse, ...args: TGetParams) {
    const parameters = await this.parseArguments(...args)
    await this.beforeCall?.(...parameters)
    const payload = await this.makeRequest(...parameters)

    return this.responseManager.succed(response, payload)
  }

  // Allows for full typesafety without passing parseArguments at instance declaration level
  protected async parseArguments(
    ...args: TGetParams
  ): Promise<ExtraWithCall<TExtraParams, TCallParams>> {
    // These casts are safe because the ternary condition mirrors the same conditional type logic used in the type of ...args.
    // - If getArgs is undefined, args already match ConditionalParams<TExtraParams, TCallParams>
    // - Otherwise, getArgs(...args) produces that same shape.
    const parameters =
      this.getArgs === undefined ?
        (args as unknown as ExtraWithCall<TExtraParams, TCallParams>)
      : await this.getArgs(...args)

    return parameters
  }

  abstract makeRequest(
    ...parameters: ExtraWithCall<TExtraParams, TCallParams>
  ): Promise<TPayload>

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

  call(...args: TGetParams) {
    return this.callWithOptions(undefined, ...args)
  }

  async callWithOptions(handlers?: Partial<THandlers>, ...args: TGetParams) {
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
      response = this.finalStatement(
        response as TResponseFailure | TResponseSuccess
      )
      mergedHandlers.onFinal?.(response)
    }

    return response
  }
}

export { ASCallBase }
