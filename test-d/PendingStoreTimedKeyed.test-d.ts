import { expectError, expectType } from 'tsd'
import { PendingStoreTimedKeyed } from '../src/core/PendingStoreTimedKeyed'

// Basic instantiation
const store = new PendingStoreTimedKeyed<string, string>()

// `set` should accept a promise of string payload and string key
store.set('user:1', Promise.resolve('ok'))

//  `get` returns either Promise<string> or undefined
expectType<Promise<string> | undefined>(store.get('user:1', 1000))

// `delete` accepts a string key
store.delete('user:1')

// `set` should reject wrong payload type
// @ts-expect-error test expects error: Argument of type 'Promise<number>' is not assignable to parameter of type 'Promise<string>'.
expectError(store.set('user:2', Promise.resolve(123)))

// `set` should reject wrong key type
// @ts-expect-error test expects error: Argument of type 'number' is not assignable to parameter of type 'string'
expectError(store.set(123, Promise.resolve('payload')))

// `get` should reject wrong key type
// @ts-expect-error test expects error: Argument of type 'number' is not assignable to parameter of type 'string'.
expectError(store.get(123, 1000))

// Works fine with number keys and object payloads
const store2 = new PendingStoreTimedKeyed<{ id: number }, number>()
store2.set(1, Promise.resolve({ id: 1 }))
expectType<Promise<{ id: number }> | undefined>(store2.get(1, 500))

//  should not accept a key of wrong type
// @ts-expect-error test expects error: Argument of type 'string' is not assignable to parameter of type 'number'.
expectError(store2.set('wrong', Promise.resolve({ id: 2 })))

// Should allow subtypes of payload
interface User {
  id: number
  name: string
}
interface ExtendedUser extends User {
  email: string
}

const store3 = new PendingStoreTimedKeyed<User, string>()
const promise = Promise.resolve<ExtendedUser>({ id: 1, name: 'A', email: 'x' })
store3.set('u1', promise) // valid — subtype of User

//  Should reject narrower payloads
expectError(
  // @ts-expect-error test expects error:  Argument of type 'Promise<{ id: number; }>' is not assignable to parameter of type 'Promise<User>'.
  store3.set('u2', Promise.resolve({ id: 2 })) // missing `name`
)
