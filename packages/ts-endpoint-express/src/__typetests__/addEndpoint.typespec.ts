import { AddEndpoint } from 'ts-endpoint-express/src';
import { Endpoint, EndpointError } from 'ts-endpoint';
import * as t from 'io-ts';
import * as express from 'express';
import { left, right } from 'fp-ts/Either';
import { IOError } from 'ts-shared/lib/errors';

const getEndpoint = Endpoint({
  Input: {
    Params: { id: t.string },
    Headers: { auth: t.string },
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const postEndpoint = Endpoint({
  Input: {
    Body: t.type({ content: t.string }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const postEndpointWithErrors = Endpoint({
  Input: {
    Body: t.type({ content: t.string }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Errors: [
    EndpointError(404, t.type({ error: t.string })),
    EndpointError(401, t.type({ baz: t.string })),
  ],
});

const router = express.Router();

// @dts-jest:fail:snap should not allow empty calls
AddEndpoint();

// @dts-jest:fail:snap won't compile if output of controller is wrong
AddEndpoint(router)(getEndpoint, ({ headers: { auth }, params: { id } }) => () => {
  console.log(auth, id);
  return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non existent param
AddEndpoint(router)(getEndpoint, ({ headers: { baz }, params: { id } }) => () => {
  console.log(baz, id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non defined body
AddEndpoint(router)(getEndpoint, ({ headers: { auth }, params: { id }, body: { foo } }) => () => {
  console.log(auth, id, foo);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:pass:snap correct constructions should work
AddEndpoint(router)(getEndpoint, ({ headers: { auth }, params: { id } }) => () => {
  console.log(auth, id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:pass:snap correct constructions should work
AddEndpoint(router)(postEndpoint, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
});

// @dts-jest:fail:snap you cannot return a badly formatted error
AddEndpoint(router)(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(left({ foo: 'baz' }));
});

AddEndpoint(router)(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  // @dts-jest:fail:snap you cannot return a badly formatted error
  return Promise.resolve(left(new IOError('error', { kind: 'KnownError', error: 'foo' })));
});

AddEndpoint(router)(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(
    // @dts-jest:fail:snap you cannot return a badly formatted error
    left(new IOError('error', { kind: 'KnownError', status: 401, body: { error: 'foo' } }))
  );
});

// @dts-jest:pass:snap you can return a well formatted error
AddEndpoint(router)(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(
    left(new IOError('error', { kind: 'KnownError', status: 404, body: { error: 'foo' } }))
  );
});
