## ts-endpoint

### install

```
$> yarn add ts-endpoint
```

### peerDependencies

- "fp-ts": "^2.0.0",
- "io-ts": "^2.2.7"

### description

`ts-endpoint` lets you define endpoints just once for both client and server, thus allowing full-stack safety.
In doing so it also exposes some utilities to automate the most repetitive tasks that you usually need to perform manually.

### simple guide

First define your endpoints:

```ts
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';

const getCrayons = Endpoint({
  Input: {
    Query: t.strict({ color: t.string }),
    Params: t.strict({ id: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.strict({ crayons: t.array(t.string) }),
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

Then derive your fetch client for it:

```ts
import { GetFetchHTTPClient } from 'ts-endpoint/browser/fetch';

const fetchClient = GetFetchHTTPClient(
  { protocol: 'http', host: 'test' },
  { getCrayons, createUser },
  { 'Content-type': 'application/json' }
);
```

Use it however you wish:

```ts
const myCrayons: TaskEither<IOError, { crayons: string[] }> = fetchClient.getCrayons({
  Params: { id: 'id' },
  Query: { color: 'brown' },
});
/** performs:
 * fetch(
 *   'http://test:2020/users/id/crayons?color=brown',
 *   { headers: { 'Content-type':'application/json' }, method: 'GET'}
 * )
 */

const createdUserId: TaskEither<IOError, { id: string }> = fetchClient.createUser({
  Body: {
    name: 'John',
    surname: 'Doe',
    age: 24,
  },
});
/** performs:
 * fetch(
 *   'http://test/users',
 *   {
 *     headers: { 'Content-type':'application/json' },
 *     method: 'POST,
 *     body: { name: "John", surname: "Doe", age: 24 }
 *   }
 * )
 */
```

`GetFetchHTTPClient` will format errors in its own opinionated way, returning either a **NetworkError** (if the request fails without further info) a 'ClientError' (if the response status is >= 400 and <= 451), a **DecodingError** (if the body of the response is different from the specification in the `Endpoint` definition), or a **ServerError** (in all other cases).
The only difference between the errors being the `kind` (accessible under the error `details`) and the fact that if the error has `kind=DecodingError` it will also have an array of errors in its `details` object.

**N.B.**: `GetFetchHTTPClient` is very opinionated, if you need a less opinionated version you can derive your own implementation using `GetHTTPClient`.
