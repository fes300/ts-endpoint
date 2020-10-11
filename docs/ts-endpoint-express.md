---
id: ts-endpoint-express
title: ts-endpoint-express
sidebar_label: Using `ts-endpoint` with an `express` app.
---

### install

```
$> yarn add ts-endpoint-express
```

### peerDependencies

- "fp-ts": "^2.0.0"
- "io-ts": "^2.2.7"
- "express": "^4.17.1"

### description

`ts-endpoint-express` works in tandem with `ts-endpoint` in order to let you define endpoints just once for both client and server.
It is specifically developed to target the `express` framework.

### simple guide

First define your endpoints with `ts-endpoint`:

```ts
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint';

const getCrayons = Endpoint({
  Input: {
    Params: t.strict({ id: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.strict({ crayons: t.array(t.string) }),
});
```

Then build add the endpoints to your `express` router:

```ts
import { AddEndpoint } from 'ts-endpoint-express';
import * as express from 'express';
import * as TA from 'fp-ts/lib/TaskEither';

const router = express.Router();

AddEndpoint(router)(getCrayons, ({ params: { id } }) => {
  const user: TA.TaskEither<unknown, { crayons: string[] }> = userService.getByID(id);

  return pipe(
    user,
    TA.map(({ crayons }) => ({ body: { crayons }, statusCode: 200 }))
  );
});
```
