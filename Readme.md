# ASCall

[![npm version](https://img.shields.io/npm/v/ascall.svg)](https://www.npmjs.com/package/ascall)
[![npm downloads](https://img.shields.io/npm/dm/ascall.svg)](https://www.npmjs.com/package/ascall)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![eslint](https://img.shields.io/badge/lint-eslint-4B32C3.svg)](https://eslint.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Conventional Commits](https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

---

ASCall is a lightweight, strongly-typed TypeScript library for orchestrating
asynchronous operations and returning standardized responses. It provides a
flexible framework for managing success/failure outcomes, concurrency, and
lifecycle control across complex workflows.

## 📘 Table of Contents

1. [Installation](#installation)
2. [Overview](#overview)
3. [Core Concepts](#core-concepts)
4. [ASCall Variants](#ascall-variants)
5. [Usage Examples](#usage-examples)
6. [Extending Base Classes](#extending-base-classes)
7. [Testing & Development](#testing--development)
8. [License](#license)

### 🧩 Installation

Using npm:

```bash
npm install ascall
```

Using yarn:

```bash
yarn add ascall
```

### 🧭 Overview

ASCall standardizes how asynchronous operations are executed and how results are
represented. It ensures every call returns a typed, predictable, and consistent
response.

The library is built around:

- 🧱 `Response` - standardized result wrapper
- ⚙️ `ResponseManager` - type-safe response builder
- 🔁 `ASCall` family - orchestrators for different async calling patterns
- 🧠 Extensible base classes - for building custom call strategies

### ⚙️ Core Concepts

#### Response

Encapsulates operation outcomes in a single structure:

```ts
const success = new Response(true, { data: 'ok' }, null)
const failure = new Response(false, null, new Error('Something went wrong'))
```

#### Response Manager

Implements ResponseManager type, it ensures all Response instances are correctly
typed and constructed. Created via `createResponseManager()` the most basic one
for Response, methods like fail succed don't really need to return the new
instance of Response it's just for typing purpose, you may mutate the response
instance and just cast it as required type

#### 🧬 ASCall Variants

The library provides multiple specialized implementations of the base
`ASCallBase`:

| Class                      | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `ASCall`                   | Base implementation for simple async orchestration.      |
| `ASCallDedumped`           | Prevents concurrent duplicate calls (deduplication).     |
| `ASCallDedumpedKeyed`      | Deduplicates calls by unique keys.                       |
| `ASCallDedumpedKeyedTimed` | Deduplicates and throttles calls by key and time window. |
| `ASCallBase`               |                                                          |
| `ASCallDedumpedBase`       |                                                          |

All variants share the same core principles and typing system - but apply
different call strategies.

## 🚀 Usage Examples

#### Basic Example (ASCall)

```ts
import { ASCall, createResponseManager, parseError } from 'ascall'

const ascall = new ASCall(
  async () => {
    console.log('Executing action...')
    return 'Hello from ASCall!'
  },
  {
    parseError,
    responseManager: createResponseManager<void, Error>(),
  }
)

const response = await ascall.call()

if (response.isSuccess()) {
  console.log('✅ Success:', response.getPayload())
} else {
  console.error('❌ Failure:', response.getError())
}
```

#### Deduplication Example (ASCallDedumped)

```ts
import { ASCallDedumped, createResponseManager, parseError } from 'ascall'

const dedumpedCall = new ASCallDedumped(
  async () => {
    console.log('Fetching data...')
    return 'Data result'
  },
  {
    parseError,
    responseManager: createResponseManager<string, Error>(),
  }
)

// Multiple calls executed nearly simultaneously
const [r1, r2, r3] = await Promise.all([
  dedumpedCall.call(),
  dedumpedCall.call(),
  dedumpedCall.call(),
])

console.log(r1 === r2 && r2 === r3) // true -> same Promise reused
```

**Use case:** Avoids redundant concurrent API calls (e.g. clicking a button
multiple times rapidly).

#### **Keyed Deduplication Example (ASCallDedumpedKeyed)**

```ts
import { ASCallDedumpedKeyed, createResponseManager, parseError } from 'ascall'

const fetchUser = new ASCallDedumpedKeyed(
  async (id: number) => {
    console.log('Fetching user', id)
    return { id, name: 'User ' + id }
  },
  {
    parseError,
    responseManager: createResponseManager<
      { id: number; name: string },
      Error
    >(),
  }
)

// Deduplicates by key (here: user ID)
const [u1, u2] = await Promise.all([fetchUser.call(1, 1), fetchUser.call(1, 1)])

console.log(u1 === u2) // true
```

**Use case:** Prevents duplicate network requests for the same key (e.g. same
user ID).

#### Keyed + Timed Deduplication Example (ASCallDedumpedKeyedTimed)

```ts
import {
  ASCallDedumpedKeyedTimed,
  createResponseManager,
  parseError,
} from 'ascall'

const fetchUser = new ASCallDedumpedKeyedTimed(
  async (id: number) => {
    console.log('Fetching user', id)
    return { id, name: 'User ' + id }
  },
  {
    parseError,
    responseManager: createResponseManager<
      { id: number; name: string },
      Error
    >(),
  }
)

// First call triggers an actual request
const first = await fetchUser.call(1, 0, 1)

// Second call within 3s reuses the same response
const second = await fetchUser.call(1, 3000, 1)

setTimeout(async () => {
  // After 3 seconds, a new request is made
  const third = await fetchUser.call(1, 3000, 1)
  console.log(third !== first) // true
}, 4000)
```

**Use case:** Caches async calls for a short period to avoid unnecessary
re-fetching.

## 🧩 Extending Base Classes

All `ASCallBase` variants are built on a shared base class hierarchy that you
can extend to create custom logic.

For example, you can create your own Timed Retry `ASCall`:

```ts
import { Response, ASCallBase } from 'ascall'

class ASCallRetriable<
  TPayload,
  TError extends Error,
  TCallParams extends unknown[],
  TResponse extends Response<undefined, undefined, boolean>,
  TResponseSuccess extends Response<TPayload, undefined, true>,
  TResponseFailure extends Response<unknown, TError, false>,
> extends ASCallBase<
  TPayload,
  TError,
  TCallParams,
  TResponse,
  TResponseSuccess,
  TResponseFailure
> {
  private retries = 3

  async makeRequest(...parameters: TCallParams): Promise<TPayload> {
    let lastError: unknown

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const payload = await this.request(...parameters)
        return payload
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  }
}
```

This design pattern allows you to:

    - Override lifecycle methods
    - Inject caching, throttling, or queuing behavior
    - Maintain type safety throughout

### 🧪 Testing & Development

Run all tests:

```bash
npm run test
```

Generate coverage:

```bash
npm run test -- --coverage
```

```bash
npm run lint:check
npm run format:check
```

Build the package:

```bash
npm run build
```

---

📄 License

ISC License Copyright © 2025 - saberls
