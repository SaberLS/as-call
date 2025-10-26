import { Handlers } from './Handlers'
import { Response } from './Response/Response'

class ASCallHandlers<TPayload, TError extends Error> extends Handlers<
  void,
  Response<TPayload, undefined, true>,
  Response<unknown, TError, false>
> {}

export { ASCallHandlers }
