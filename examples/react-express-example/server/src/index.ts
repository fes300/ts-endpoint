import { getUser } from 'shared';
import { GetEndpointSubscriber } from 'ts-endpoint-express';
import express from 'express';
import * as TA from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { IOError } from 'ts-io-error';

const database = [
  { id: 1, name: 'John', surname: 'Doe', age: 22 },
  { id: 2, name: 'Michael', surname: 'Black', age: 51 },
];

function getUserFromDB(id: number) {
  return TA.fromEither(E.fromNullable('user not found')(database.find((u) => u.id === id)));
}

const app = express();

const router = express.Router();

const registerRouter = GetEndpointSubscriber((errors) => {
  return new IOError('error decoding args', {
    kind: 'DecodingError',
    errors,
  });
});
const AddEndpoint = registerRouter(router);

AddEndpoint(getUser, ({ params: { id } }) => {
  const user = getUserFromDB(id);

  return pipe(
    user,
    TA.mapLeft((e) => new IOError('user not found.', { kind: 'ClientError', status: '404' })),
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
