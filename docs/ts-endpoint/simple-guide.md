---
id: simple-guide
title: simple guide to start with `ts-endpoint`
---

Other than plain static types definitions, when you define an Endpoint you also want it to be able to validate, serialize and deserialize HTTP payloads into runtime values that are easy to handle in your source code.

In `ts-endpoint` this power is encapsulated in the `Codec` interface:

```ts
export interface Codec<E, A, B> {
  encode: (b: B) => A;
  decode: (b: unknown) => Either<E, B>;
}
```

Fur our purposes, a `Codec` is a data structure that knows how to:
- `encode` a runtime value into a valid transport layer format
-  `decode` a value coming from the transport layer into a valid runtime value (or an error in case the value is not well-formatted).

A valid Endpoint will use a specific `Codec` to parse both its Input and Output runtime values:

(**N.B.:** in the following examples we use `io-ts` library to create the codecs but feel free to define your own as long as they follow the `Codec` interface)

```ts
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';

const User = t.type({
  id: t.number,
  name: t.string,
  surname: t.string,
  age: t.number
})

export const getUser = Endpoint({
  Input: {
    Params: t.type({ id: NumberFromString }),
  },
  Method: 'GET',
  getPath: ({ id }) => `user/${id}`,
  Output: t.type({ user: User }),
});

const createUser = Endpoint({
  Input: {
    Body: t.strict({
      name: t.string,
      surname: t.string,
      age: t.number,
    }),
  },
  Method: 'POST',
  getPath: () => 'users',
  Output: t.strict({ id: t.string }),
});
```
