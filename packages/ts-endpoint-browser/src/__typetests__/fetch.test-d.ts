import { Schema } from 'effect';
import { mapLeft, right } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { Endpoint } from 'ts-endpoint';
import { IOError } from 'ts-io-error';
import { assertType, describe, expectTypeOf, it } from 'vitest';
import { StaticHTTPClientConfig } from '../config';
import { GetFetchHTTPClient } from '../fetch';
import { InferFetchResult } from '../index';

const options: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'http://test',
  port: 2020,
};

const endpoints = {
  prova: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  provaNoParam: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  provaWithoutInput: Endpoint({
    Method: 'GET',
    getPath: () => `users`,
    Output: Schema.Struct({ noInput: Schema.Array(Schema.String) }),
  }),
  provaWithError: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Errors: {
      401: Schema.Struct({ foo: Schema.String }),
      402: Schema.Struct({ baz: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
};

const fetchClient = GetFetchHTTPClient(options, endpoints, {
  decode: (schema) => (input) =>
    pipe(
      input,
      Schema.decodeUnknownEither(schema as Schema.Schema<any>),
      mapLeft(
        (_) =>
          new IOError('Validation error', {
            kind: 'DecodingError',
            errors: [],
          })
      )
    ),
  handleError: (err) => err,
});

describe('FetchClient', () => {
  it('should allow to call the endpoint with the correct input', () => {
    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf<string>();

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf<{ Body: number }>();

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Query: 1,
    });

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Params: 1,
    });

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Headers: 1,
    });

    expectTypeOf(fetchClient).not.toEqualTypeOf<{ prova: () => any }>();
    expectTypeOf(fetchClient).not.toEqualTypeOf<{
      prova: (args: { Params: { id: string } }) => any;
    }>();

    // @ts-expect-error
    expectTypeOf(fetchClient.prova).not.toMatchObjectType({
      Params: { id: '123', foo: 'baz' },
      Query: { color: 'marrone' },
    });

    // @ts-expect-error
    expectTypeOf(fetchClient).not.toMatchObjectType({
      Params: { id: '123' },
      Query: { color: 'marrone' },
      // @dts-jest:fail:snap should not allow to add Body when not declared in the endpoint
      Body: { foo: 'baz' },
    });

    expectTypeOf(right({})).not.toEqualTypeOf<InferFetchResult<typeof fetchClient.prova>>();

    assertType<InferFetchResult<typeof fetchClient.prova>>(right({ crayons: ['brown'] }));

    // const provaWithError = pipe(
    //   fetchClient.provaWithError({
    //     Params: { id: '123' },
    //     Query: { color: 'marrone' },
    //   }),
    //   TA.mapLeft((err) => {
    //     if (err.details.kind === 'KnownError') {
    //       if (err.details.status === 401) {
    //         // @dts-jest:pass:snap you can access KnownErrors with the correct typeguard
    //         err.details.body.foo;

    //         // @dts-jest:fail:snap you cannot access KnownErrors without the correct typeguard
    //         err.details.body.baz;
    //       }
    //     }
    //   })
    // );
  });
});
