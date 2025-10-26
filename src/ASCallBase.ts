import type { Handlers } from './Handlers'
import { Response } from './Response/Response'
import type { BaseResponseBuilder } from './ResponseBuilder/BaseResponseBuilder'

// TODO add ability to use diffrent handlers not only ASCallHandlers
abstract class ASCallBase<
  TPayload,
  TCallParams extends unknown[],
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
  TStart = void,
  TError extends Error = Error,
  TGetParams extends unknown[] = TCallParams,
  TResponseBuilder extends BaseResponseBuilder<
    TPayload,
    TError,
    TStart,
    TResponseFailure,
    TResponseSuccess
  > = BaseResponseBuilder<
    TPayload,
    TError,
    TStart,
    TResponseFailure,
    TResponseSuccess
  >,
  THandlers extends Handlers<
    TStart,
    TResponseSuccess,
    TResponseFailure
  > = Handlers<TStart, TResponseSuccess, TResponseFailure>,
> {
  abstract readonly responseBuilder: TResponseBuilder
  abstract readonly handlers: THandlers

  readonly request: Reguest<TCallParams, TPayload>
  readonly getArgs?: GetArgs<TGetParams, TCallParams> | undefined

  readonly name: string

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<Options<TCallParams, TGetParams>>
  ) {
    this.request = request
    this.name = options?.name ?? request.name

    this.getArgs = options?.getArgs
  }

  private async getParameters(
    ...args: TCallParams | TGetParams
  ): Promise<TCallParams> {
    const parameters =
      this.getArgs === undefined ?
        (args as TCallParams)
      : await this.getArgs(...(args as TGetParams))

    return parameters
  }

  async makeRequest(...parameters: TCallParams) {
    const res: TPayload = await this.request(...parameters)
    return res
  }

  abstract parseError(error_: unknown): TError | Promise<TError>

  async call(
    // TODO: pass custom handlers to individual call
    // handlers?: Handlers,
    // if getArgs is undefined take arguments of Call
    ...args: this['getArgs'] extends undefined ? TCallParams : TGetParams
  ) {
    try {
      const parameters = await this.getParameters(...args)
      this.handlers.handleStart(this.responseBuilder.init())

      const payload = await this.makeRequest(...parameters)
      this.responseBuilder.setPayload(payload)
      this.responseBuilder.setSuccess(true)

      this.handlers.handleSuccess(this.responseBuilder.succed())
    } catch (error_: unknown) {
      const error: TError = await this.parseError(error_)
      this.responseBuilder.setError(error)

      this.handlers.handleFailure(this.responseBuilder.fail())
    } finally {
      this.handlers.handleFinal(
        this.responseBuilder.isSuccessfull() ?
          this.responseBuilder.succed()
        : this.responseBuilder.fail()
      )
    }

    const build = this.responseBuilder.build()
    return build
  }
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
