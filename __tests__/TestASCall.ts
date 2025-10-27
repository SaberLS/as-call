/* eslint-disable unicorn/consistent-function-scoping */ // arrow functions need to be in jest.fn scope otherwise they lose this
import { ASCallBase } from '../src/ASCallBase'
import type { Handlers } from '../src/Handlers'
import { Response } from '../src/Response/Response'

// Concrete test subclass
class TestASCallBase<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<TPayload, Error, TCallParams, TGetParams> {
  parseError(error_: unknown): Error | Promise<Error> {
    if (error_ instanceof Error) return error_

    return typeof error_ === 'string' ?
        new Error(error_)
      : new Error('Unknown error cause', { cause: error_ })
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

class TestASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends TestASCallBase<TPayload, TCallParams, TGetParams> {
  fail = jest.fn(
    <T extends Response<unknown, unknown, boolean>>(
      instance: T,
      error: Error
    ): Response<unknown, Error, false> => super.fail(instance, error)
  )
  succed = jest.fn(
    <T extends Response<unknown, unknown, boolean>>(
      instance: T,
      payload: TPayload
    ): Response<TPayload, undefined, true> => super.succed(instance, payload)
  )

  init = jest.fn((): Response<undefined, undefined, boolean> => super.init())

  call = jest.fn(
    (
      ...args: this['getArgs'] extends undefined ? TCallParams : TGetParams
    ): Promise<
      Response<unknown, Error, false> | Response<TPayload, undefined, true>
    > => super.call(...args)
  )

  callWithOptions = jest.fn(
    (
      handlers?: Partial<
        Handlers<
          [response: Response<undefined, undefined, boolean>],
          Response<TPayload, undefined, true>,
          Response<unknown, Error, false>
        >
      >,
      ...args: this['getArgs'] extends undefined ? TCallParams : TGetParams
    ): Promise<
      Response<unknown, Error, false> | Response<TPayload, undefined, true>
    > => super.callWithOptions(handlers, ...args)
  )
}

export { TestASCall, TestASCallBase }
