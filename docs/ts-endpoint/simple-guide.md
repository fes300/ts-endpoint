---
id: simple-guide
title: simple guide to start with `ts-endpoint`
---

First define your endpoints:

```ts
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';

export const getUser = Endpoint({
  Input: {
    Params: { id: NumberFromString },
  },
  Method: 'GET',
  getPath: ({ id }) => `user/${id}`,
  Output: t.strict({ user: User }),
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

Then add implementations to your express server:

```ts
import express from 'express';
import { getUser } from 'shared';
import { AddEndpoint } from 'ts-endpoint-express/lib';
import * as TA from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { IOError } from 'ts-io-error/lib/errors';

const database = [
  { id: 1, name: 'John', surname: 'Doe', age: 22 },
  { id: 2, name: 'Michael', surname: 'Black', age: 51 },
];

function getUserFromDB(id: number) {
  return TA.fromEither(E.fromNullable('user not found')(database.find((u) => u.id === id)));
}

const app = express();

const router = express.Router();

AddEndpoint(router)(getUser, ({ params: { id } }) => {
  const user = getUserFromDB(id);

  return pipe(
    user,
    TA.mapLeft((e) => new IOError(404, e, { kind: 'ClientError' })),
    TA.map((userFromDB) => ({
      body: { user: userFromDB },
      statusCode: 200,
    }))
  );
});

app.use(router);

app.listen(3000, () => {});
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
