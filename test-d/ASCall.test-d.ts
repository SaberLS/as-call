/* eslint-disable @typescript-eslint/require-await */
import { expectType } from 'tsd'
import { ASCall } from '../src/ASCall'
import { ResponseFailure, ResponseSuccess } from '../src/Response/Response'

// This should pass
const asc = new ASCall(async () => 1)
expectType<Promise<ResponseFailure<Error> | ResponseSuccess<number>>>(
  asc.call()
)
