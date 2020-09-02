import { AddEndpoint } from '..';
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

describe('AddEndpoint types behave accordingly', () => {
  // @ts-expect-error
  AddEndpoint();

  // won't compile if output oc controller is wrong
  // @ts-expect-error
  AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id } }) => () => {
    console.log(auth, id);
    return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
  });

  // won't compile if trying to access non existent param
  // @ts-expect-error
  AddEndpoint(router)(endpoint, ({ headers: { baz }, params: { id } }) => () => {
    console.log(baz, id);
    return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
  });

  // won't compile if trying to access non defined body
  // // @ts-expect-error
  // AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id }, body: { foo } }) => () => {
  //   console.log(auth, id, foo);
  //   return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
  // });

  AddEndpoint(router)(endpoint, ({ headers: { auth }, params: { id } }) => () => {
    console.log(auth, id);
    return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
  });

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
