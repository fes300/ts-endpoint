import { getUser } from 'shared';
import { AddEndpoint } from 'ts-endpoint-express/lib';
import express from 'express';
import * as TA from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { IOError } from 'ts-shared/lib/errors';

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

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
