import { AddEndpoint } from 'ts-endpoint-express/src';
import { Endpoint } from 'ts-endpoint';
import * as t from 'io-ts';
import * as express from 'express';
import { right } from 'fp-ts/lib/Either';

const endpoint = Endpoint({
  Input: {
    Params: { id: t.string },
    Headers: { auth: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const router = express.Router();

// @dts-jest:fail:snap should not allow empty calls
AddEndpoint();

// @dts-jest:fail:snap won't compile if output oc controller is wrong
AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id } }) => () => {
  console.log(auth, id);
  return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non existent param
AddEndpoint(router)(endpoint, ({ headers: { baz }, params: { id } }) => () => {
  console.log(baz, id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non defined body
AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id }, body: { foo } }) => () => {
  console.log(auth, id, foo);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:pass:snap correct constructions should work
AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id } }) => () => {
  console.log(auth, id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});
