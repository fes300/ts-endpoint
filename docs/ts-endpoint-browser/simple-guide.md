---
id: simple-guide
title: simple-guide to start with `ts-endpoint-browser`
sidebar_label: using `ts-endpoint` in your browser
---

First define your endpoints:

```ts
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';

const getCrayons = Endpoint({
  Input: {
    Query: { color: t.string },
    Params: { id: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
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
  Output: { id: t.string },
});
```

Then derive your fetch client for it:

```ts
import { GetFetchHTTPClient } from 'ts-endpoint-browser/lib/fetch';

const fetchClient = GetFetchHTTPClient(
  { protocol: 'http', host: 'test' },
  { getCrayons, createUser },
  { 'Content-type': 'application/json' }
);
```

And use it in your browser:

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

### `IOError`

`GetFetchHTTPClient` formats errors in its own opinionated way, returning:

- **NetworkError** if the request fails without info about the failure
- **ClientError** if the response status is >= 400 and <= 451),
- **DecodingError** if the body of the response is different from the specification in the `Endpoint` definition, or a
- **ServerError** (in all other cases).

The only difference between each error is the `kind` (accessible under the error `details`) and the fact that if the error kind is `DecodingError` it will also expose an array of errors in its `details` object.

**N.B.**: if you need a less opinionated version of `GetFetchHTTPClient` you can derive your own implementation using `GetHTTPClient`.
