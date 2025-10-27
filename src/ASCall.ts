import { ASCallBase } from './ASCallBase'
import { Response } from './Response/Response'

class ASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<TPayload, Error, TCallParams, TGetParams> {
  parseError(error_: unknown): Error | Promise<Error> {
    if (error_ instanceof Error) return error_

    return new Error('Unknown Error', { cause: error_ })
  }

  init(): Response<undefined, undefined, boolean> {
    return new Response(false, undefined, undefined)
  }

  succed<T extends Response<unknown, unknown, boolean>>(
    instance: T,
    payload: TPayload
  ): Response<TPayload, undefined, true> {
    return new Response(true, payload, undefined)
  }

  fail<T extends Response<unknown, unknown, boolean>>(
    instance: T,
    error: Error
  ): Response<unknown, Error, false> {
    return new Response(false, instance.getPayload(), error)
  }
}

export { ASCall }
