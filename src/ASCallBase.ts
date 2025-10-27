import type { Handlers } from './Handlers'
import { Response } from './Response/Response'

abstract class ASCallBase<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
  TResponse extends Response<undefined, undefined, boolean> = Response<
    undefined,
    undefined,
    boolean
  >,
  TResponseSuccess extends Response<TPayload, undefined, true> = Response<
    TPayload,
    undefined,
    true
  >,
  TResponseFailure extends Response<unknown, TError, false> = Response<
    unknown,
    TError,
    false
  >,
  THandlers extends Handlers<
    [response: TResponse],
    TResponseSuccess,
    TResponseFailure
  > = Handlers<[response: TResponse], TResponseSuccess, TResponseFailure>,
> {
  readonly request: Reguest<TCallParams, TPayload>
  readonly handlers: Partial<THandlers> | undefined
  readonly getArgs?: GetArgs<TGetParams, TCallParams> | undefined

  readonly name: string

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<
      Options<TCallParams, TGetParams> & { handlers: Partial<THandlers> }
    >
  ) {
    this.request = request
    this.name = options?.name ?? request.name

    this.handlers = options?.handlers
    this.getArgs = options?.getArgs
  }

  protected async tryStatement(
    response: TResponse,
    ...args: this['getArgs'] extends undefined ? TCallParams : TGetParams
  ) {
    const parameters = await this.parseArguments(...args)
    const payload = await this.makeRequest(...parameters)

    return this.succed(response, payload)
  }

  protected async parseArguments(
    ...args: TCallParams | TGetParams
  ): Promise<TCallParams> {
    const parameters =
      this.getArgs === undefined ?
        (args as TCallParams)
      : await this.getArgs(...(args as TGetParams))

    return parameters
  }

  async makeRequest(...parameters: TCallParams) {
    const payload = await this.request(...parameters)
    return payload
  }

  async catchStatement(
    instance: TResponse | TResponseSuccess,
    error_: unknown
  ) {
    const error = await this.parseError(error_)

    return this.fail(instance, error)
  }
  abstract parseError(error_: unknown): TError | Promise<TError>

  finalStatement(response: TResponseFailure | TResponseSuccess) {
    return response
  }

  call(...args: this['getArgs'] extends undefined ? TCallParams : TGetParams) {
    return this.callWithOptions(undefined, ...args)
  }

  async callWithOptions(
    handlers?: Partial<THandlers>,
    // if getArgs is undefined take arguments of Call
    ...args: this['getArgs'] extends undefined ? TCallParams : TGetParams
  ) {
    const mergedHandlers = { ...this.handlers, ...handlers }
    let response: TResponse | TResponseFailure | TResponseSuccess = this.init()
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
  abstract init(): TResponse
  abstract succed<T extends Response<unknown, unknown, boolean>>(
    instance: T,
    payload: TPayload
  ): TResponseSuccess
  // {
  // example implementation
  //   const newInstance = new Response<TPayload, undefined, true>(true, payload)

  //   return newInstance
  // }

  abstract fail<T extends TResponse | TResponseSuccess>(
    instance: T,
    error: TError
  ): TResponseFailure
  // example implementation for Response
  // {
  //   const newInstance = new Response<unknown, TError, false>(
  //     false,
  //     instance.getPayload(),
  //     error
  //   )

  //   return newInstance
  // }
}

type GetArgs<TParams extends unknown[], TCallParams extends unknown[]> =
  | ((...args: TParams) => TCallParams)
  | ((...args: TParams) => Promise<TCallParams>)

type Reguest<TCallParams extends unknown[], TPayload> = (
  ...args: TCallParams
) => Promise<TPayload>

interface Options<TCallParams extends unknown[], TGetParams extends unknown[]> {
  name: string
  getArgs: GetArgs<TGetParams, TCallParams>
}

export { ASCallBase }
export type { GetArgs, Options, Reguest }
