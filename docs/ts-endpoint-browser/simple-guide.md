---
id: simple-guide
title: simple-guide to start with `ts-endpoint-browser`
sidebar_label: using `ts-endpoint` in your browser
---

Once you have defined your endpoints with `ts-endpoint`, you may want to use those definitions for something useful, that's where `ts-endpoint-browser` comes into play.

If you want to derive an HTTP client with zero effort, you can use the utility `GetFetchHTTPClient` and pass your endpoints to it:

(**N.B.:** `GetFetchHTTPClient` is quite opinionated on how it will handle errors, if you need more control you can use the lower-level API `GetHTTPClient`)

```ts
import { getCrayons, createUser } from "./endpoints"
import { GetFetchHTTPClient } from 'ts-endpoint-browser';

const fetchClient = GetFetchHTTPClient(
  { protocol: 'http', host: 'google' },
  { getCrayons, createUser },
  { defaultHeaders: { 'Content-type': 'application/json' } }
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

- **KnownError** when the response status coincide with one of those defined in the Endpoint definition (in this case the payload is validated against the corresponding Error Codec).
- **NetworkError** if the request fails without info about the failure
- **ClientError** if the response status is >= 400 and <= 451),
- **DecodingError** if the body of the response is different from the specification in the `Endpoint` definition, or a
- **ServerError** (in all other cases).


The only difference between each error is the `kind` and the fact that if the error kind is `DecodingError` it will also expose an array of errors in its `details` object.

