import { ASCallBase, type Options, type Reguest } from '../src/ASCallBase'
import { Response } from '../src/Response/Response'
import { MockHandlers } from './MockHandlers'
import { MockResponseBuilder } from './MockResponseBuilder'

// Concrete test subclass
class TestASCall<
  TPayload,
  TCallParams extends unknown[],
  TGetParams extends unknown[] = TCallParams,
> extends ASCallBase<
  TPayload,
  TCallParams,
  Response<TPayload, undefined, true>,
  Response<unknown, Error, false>,
  void,
  Error,
  TGetParams
> {
  readonly responseBuilder: MockResponseBuilder<
    TPayload,
    Error,
    undefined,
    Response<unknown, Error, false>,
    Response<TPayload, undefined, true>
  >
  readonly handlers: MockHandlers<
    void,
    Response<TPayload, undefined, true>,
    Response<unknown, Error, false>
  >

  constructor(
    request: Reguest<TCallParams, TPayload>,
    options?: Partial<
      Options<TCallParams, TGetParams> & {
        handlers: ConstructorParameters<
          typeof MockHandlers<
            void,
            Response<TPayload, undefined, true>,
            Response<unknown, Error, false>
          >
        >['0']
      }
    >
  ) {
    super(request, { name: options?.name, getArgs: options?.getArgs })
    this.responseBuilder = new MockResponseBuilder(false)
    this.handlers = new MockHandlers(options?.handlers)
  }

  parseError(error_: unknown): Error {
    return error_ instanceof Error ? error_ : new Error(String(error_))
  }
}

export { TestASCall }
