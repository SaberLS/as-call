import { ASCall } from './ASCall'

class ASDedumpedCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCall<TPayload, TCallParams, TGetParams> {
  private pending: Promise<TPayload> | undefined

  async makeRequest(...parameters: TCallParams): Promise<TPayload> {
    const promise = await (this.pending ??= this.request(...parameters))
    this.pending = undefined

    return promise
  }
}

export { ASDedumpedCall }
