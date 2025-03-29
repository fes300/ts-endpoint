import * as express from 'express';
import { left, right } from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { Endpoint } from 'ts-endpoint/lib';
import { IOError } from 'ts-io-error/lib';
import { assertType, expectTypeOf, test } from 'vitest';
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


declare module '../HKT' {
  interface URItoKind<A> {
    Option: O.Option<A>;
  }
}

test('AddEndpoint', () => {
  expectTypeOf(AddEndpoint).parameter(0).not.toMatchObjectType<undefined>;

  expectTypeOf(AddEndpoint).not.toEqualTypeOf<() => void>();

  assertType(
    // @ts-expect-error crayons is not a string
    AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
      console.log(id);
      return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error params bar doesn't exists
    AddEndpoint(getEndpoint, ({ params: { id, bar } }) => () => {
      console.log(bar, id);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error body doesn't exists
    AddEndpoint(getEndpoint, ({ params: { id }, body: { foo } }) => () => {
      console.log(id, foo);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType<void>(
    AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);

      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error post endpoint doesn't have params
    AddEndpoint(postEndpoint, ({ params: { id } }) => () => {
      console.log(id);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
    })
  );

  assertType(
    AddEndpoint(postEndpoint, ({ body: { content } }) => () => {
      console.log(content);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
    })
  );

  assertType(
    // @ts-expect-error error not conforming to the schema
    AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      console.log(content);
      return Promise.resolve(left({ foo: 'baz' }));
    })
  );

  assertType(
    AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      console.log(content);

      // @ts-expect-error error kind not conforming to the schema
      return Promise.resolve(left(new IOError('error', { kind: 'KnownError', error: 'foo' })));
    })
  );

  assertType(
    AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      console.log(content);
      return Promise.resolve(
        // @ts-expect-error error kind and status not conforming to the schema
        left(new IOError('error', { kind: 'KnownError', status: 401, body: { error: 'foo' } }))
      );
    })
  );
});

test('Should work with Option kind', () => {
  const buildMaybeError = (errors: unknown[]) => {
    return O.some({
      kind: 'DecodingError',
      errors,
    });
  };

  const maybeRouter = express.Router();
  const registerMaybeRouter = GetEndpointSubscriber<'Option'>(buildMaybeError);
  const AddMaybeEndpoint = registerMaybeRouter(maybeRouter);

  assertType(
    // @ts-expect-error you cannot return a badly formatted error with a different error builder
    AddMaybeEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      console.log(content);

      return Promise.resolve(
        left(O.some({ kind: 'KnownError', status: 401, body: { error: 'foo' } }))
      );
    })
  );
});
