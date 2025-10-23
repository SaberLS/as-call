import { BaseASCall } from './BaseASCall'

class ASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends BaseASCall<TPayload, TCallParams, TGetParams> {
  parseError(error_: unknown): Error | Promise<Error> {
    if (error_ instanceof Error) return error_

    return new Error('Unknown Error', { cause: error_ })
  }
}

export { ASCall }

// -------- EXAMPLE -------
const t = async (a: number) => await Promise.resolve(a)
const ast = new ASCall(t, {
  getArgs: (a: string) => {
    return Promise.resolve([Number(a)])
  },
})

// @ts-expect-error shows type error expects the arguments of type [a: string] from passed get args
await ast.call(3)

const ast2 = new ASCall(t)
// @ts-expect-error shows type error expects the arguments of t [a: number] from passed request
await ast2.call('3')
