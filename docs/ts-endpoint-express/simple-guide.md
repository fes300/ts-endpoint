---
id: simple-guide
title: simple-guide to start with `ts-endpoint-express`
sidebar_label: using `ts-endpoint` with an `express` app.
---

Once you have defined your endpoints with `ts-endpoint` you can add them to your `express` router using the `GetEndpointSubscriber` util:

```ts
import { GetEndpointSubscriber } from 'ts-endpoint-express';
import * as express from 'express';
import * as TA from 'fp-ts/TaskEither';
import { userService } from './services'

const router = express.Router();
const registerRouter = GetEndpointSubscriber(buildIOError);
const AddEndpoint = registerRouter(router);

AddEndpoint(getCrayons, ({ params: { id } }) => {
  const user: TA.TaskEither<unknown, { crayons: string[] }> = userService.getByID(id);

  return pipe(
    user,
    TA.map(({ crayons }) => ({ body: { crayons }, statusCode: 200 }))
  );
});
```
