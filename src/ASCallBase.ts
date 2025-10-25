import { ASCallHandlers } from './ASCallHandlers'
import type { ResponseFailure, ResponseSuccess } from './Response/Response'

// TODO add ability to use diffrent handlers not only ASCallHandlers
abstract class ASCallBase<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
  TError extends Error = Error,
> {
  readonly request: Reguest<TCallParams, TPayload>
  readonly getArgs?: GetArgs<TGetParams, TCallParams> | undefined

  readonly name: string
  readonly handlers: ASCallHandlers<TPayload, TError>

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<Options<TPayload, TCallParams, TGetParams, TError>>
  ) {
    this.request = request
    this.name = options?.name ?? request.name
    this.handlers = new ASCallHandlers<TPayload, TError>(
      options?.handlers?.['0']
    )

    this.getArgs = options?.getArgs
  }

  protected async getParameters(
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
    let result!: ResponseFailure<TError> | ResponseSuccess<TPayload>

    try {
      // TODO handleStart and other handlers methods should take `parameters`
      const parameters = await this.getParameters(...args)
      this.handlers.handleStart(/*parameters*/)

      const res = await this.makeRequest(...parameters)
      result = this.handlers.handleSuccess(res /*, parameters*/)
    } catch (error_: unknown) {
      const error: TError = await this.parseError(error_)
      result = this.handlers.handleFailure(result, error /*, parameters*/)
    } finally {
      this.handlers.handleFinal(result)
    }

    return result
  }
}

type GetArgs<TParams extends unknown[], TCallParams extends unknown[]> =
  | ((...args: TParams) => TCallParams)
  | ((...args: TParams) => Promise<TCallParams>)

type Reguest<TCallParams extends unknown[], TPayload> = (
  ...args: TCallParams
) => Promise<TPayload>

interface Options<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[],
  TError extends Error = Error,
> {
  name: string
  handlers: ConstructorParameters<typeof ASCallHandlers<TPayload, TError>>
  getArgs: GetArgs<TGetParams, TCallParams>
}

export { ASCallBase }
export type { GetArgs, Options, Reguest }
