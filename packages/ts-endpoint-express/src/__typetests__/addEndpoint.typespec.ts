import * as express from 'express';
import { left, right } from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint/lib';
import { IOError } from 'ts-io-error/lib';
import { RecordCodec } from 'ts-io-error/lib/Codec';
import { buildIOError, GetEndpointSubscriber } from '../index';

const getEndpoint = Endpoint({
  Input: {
    Params: t.type({ id: t.string }),
    Headers: t.type({ auth: t.string }),
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
  Errors: { 404: t.type({ error: t.string }), 401: t.type({ baz: t.string }) },
});

const router = express.Router();
const registerRouter = GetEndpointSubscriber(buildIOError);
const AddEndpoint = registerRouter(router);

// @dts-jest:fail:snap should not allow empty calls
AddEndpoint();
// @dts-jest:fail:snap won't compile if output of controller is wrong
AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
  console.log(id);
  return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non existent param
AddEndpoint(getEndpoint, ({ params: { id, bar } }) => () => {
  console.log(bar, id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:fail:snap won't compile if trying to access non defined body
AddEndpoint(getEndpoint, ({ params: { id }, body: { foo } }) => () => {
  console.log(id, foo);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

type OutputOrUndefined<T> = T extends RecordCodec<any, any, infer R> ? R : undefined;
const v = t.type({ u: t.string });
type a = OutputOrUndefined<typeof v>;
const s: RecordCodec<any, any> = v;

// @dts-jest:pass:snap correct constructions should work
AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
  console.log(id);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
});

// @dts-jest:pass:snap correct constructions should work
AddEndpoint(postEndpoint, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
});

// @dts-jest:fail:snap you cannot return a badly formatted error
AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(left({ foo: 'baz' }));
});

AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  // @dts-jest:fail:snap you cannot return a badly formatted error
  return Promise.resolve(left(new IOError('error', { kind: 'KnownError', error: 'foo' })));
});

AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(
    // @dts-jest:fail:snap you cannot return a badly formatted error
    left(new IOError('error', { kind: 'KnownError', status: 401, body: { error: 'foo' } }))
  );
});

AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);
  return Promise.resolve(
    // @dts-jest:pass:snap you can return a well formatted error
    left(new IOError('error', { kind: 'KnownError', status: 401, body: { baz: 'foo' } }))
  );
});

export const buildMaybeError = (errors: unknown[]) => {
  return O.some({
    kind: 'DecodingError',
    errors,
  });
};

declare module '../HKT' {
  interface URItoKind<A> {
    Option: O.Option<A>;
  }
}

const maybeRouter = express.Router();
const registerMaybeRouter = GetEndpointSubscriber<'Option'>(buildMaybeError);
const AddMaybeEndpoint = registerMaybeRouter(maybeRouter);

// @dts-jest:fail:snap you cannot return a badly formatted error with a different error builder
AddMaybeEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
  console.log(content);

  return Promise.resolve(left(O.some({ kind: 'KnownError', status: 401, body: { error: 'foo' } })));
});
