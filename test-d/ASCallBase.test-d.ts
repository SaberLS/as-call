/* eslint-disable @typescript-eslint/require-await */
import { expectError, expectType } from 'tsd'
import { ASCallBase } from '../src/ASCallBase'
import { ASCallHandlers } from '../src/ASCallHandlers'
import type { ResponseFailure, ResponseSuccess } from '../src/Response/Response'

// A minimal subclass so we can instantiate ASCallBase
class MyASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<TPayload, TCallParams, TGetParams, Error> {
  readonly handlers = new ASCallHandlers<TPayload, Error>()

  parseError(error_: unknown): Error {
    return error_ instanceof Error ? error_ : new Error(String(error_))
  }
}

// --- Basic typing: request and response -------------------------------

const asc = new MyASCall(async (a: number, b: number) => a + b)

expectType<Promise<ResponseSuccess<number> | ResponseFailure<Error>>>(
  asc.call(1, 2)
)
expectError(asc.call('1', 2)) // wrong arg types

// --- Inferred argument types with getArgs undefined -------------------

type Args = Parameters<(typeof asc)['call']>
expectType<[number, number]>([1, 2] as unknown as Args) // ensures correct inference

// --- Custom getArgs: modifies call parameters -------------------------

const asc2 = new MyASCall<number, [number, number], [string]>(
  async (a, b) => a + b,
  {
    name: 'stringToNumbers',
    handlers: {},
    getArgs: (s: string) => {
      const [a, b] = s.split(',').map(Number)
      return [a, b]
    },
  }
)

// should accept single string param (TGetParams = [string])
expectType<Promise<ResponseSuccess<number> | ResponseFailure<Error>>>(
  asc2.call('3,4')
)

//  should error when passing numbers directly
expectError(asc2.call(1, 2))

// --- Custom error type -------------------------------------------------

class MyError extends Error {
  code = 500
}

const asc3 = new MyASCall<number, [number], [number], MyError>(
  async n => n * 2,
  {
    name: 'err',
    handlers: {},
    getArgs: async (n: number) => [n],
  }
)

// The error type should propagate to ResponseFailure<MyError>
expectType<Promise<ResponseSuccess<number> | ResponseFailure<MyError>>>(
  asc3.call(1)
)

// --- Async getArgs returns Promise<TCallParams> -----------------------

const asc4 = new MyASCall<number, [number, number], [string]>(
  async (a, b) => a + b,
  {
    name: 'asyncGetArgs',
    handlers: {},
    getArgs: async (s: string) => {
      const [a, b] = s.split(',').map(Number)
      return [a, b]
    },
  }
)

expectType<Promise<ResponseSuccess<number> | ResponseFailure<Error>>>(
  asc4.call('5,6')
)
expectError(asc4.call(1, 2)) // wrong param type
