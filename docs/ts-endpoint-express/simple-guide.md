---
id: simple-guide
title: simple-guide to start with `ts-endpoint-express`
sidebar_label: using `ts-endpoint` with an `express` app.
---

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
