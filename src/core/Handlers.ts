import type { Response } from '../response'

interface Handlers<
  TStart extends unknown[],
  TSuccess extends Response<unknown, undefined, true>,
  TFailure extends Response<unknown, unknown, false>,
> {
  readonly onStart: OnStart<TStart>
  readonly onSuccess: OnSuccess<TSuccess>
  readonly onFailure: OnFailure<TFailure>
  readonly onFinal: OnFinal<TSuccess | TFailure>
}

interface Options<TStart extends unknown[], TSuccess, TFailure> {
  onStart: OnStart<TStart>
  onSuccess: OnSuccess<TSuccess>
  onFailure: OnFailure<TFailure>
  onFinal: OnFinal<TSuccess | TFailure>
}

type Handler<TResponse> = (response: TResponse) => void

type OnStart<TStart extends unknown[]> = (...start: TStart) => void
type OnSuccess<TSuccess> = Handler<TSuccess>
type OnFailure<TFailure> = Handler<TFailure>
type OnFinal<TResponse> = Handler<TResponse>

export type { Handlers, Options }
