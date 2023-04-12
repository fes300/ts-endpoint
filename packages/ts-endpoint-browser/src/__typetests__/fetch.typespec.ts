import { GetFetchHTTPClient } from '../fetch';
import { Endpoint } from 'ts-endpoint/lib';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';
import { InferFetchResult } from '..';
import { right } from 'fp-ts/Either';
import * as TA from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/pipeable';

const options: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'http://test',
  port: 2020,
};

const endpoints = {
  dummy: Endpoint({
    Input: {
      Query: t.type({ color: t.string }),
      Params: t.type({ id: t.string }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  }),
  dummyNoParam: Endpoint({
    Input: {
      Query: t.type({ color: t.string }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  }),
  dummyWithoutInput: Endpoint({
    Method: 'GET',
    getPath: () => `users`,
    Output: t.type({ noInput: t.array(t.string) }),
  }),
  dummyWithError: Endpoint({
    Input: {
      Query: t.type({ color: t.string }),
      Params: t.type({ id: t.string }),
    },
    Errors: {
      401: t.type({ foo: t.string }),
      402: t.type({ baz: t.string }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
  }),
};

const fetchClient = GetFetchHTTPClient(options, endpoints, {
  handleError: (err, e) => err,
});

// @dts-jest:pass:snap should allow empty calls when input is not defined
fetchClient.dummyWithoutInput();

// @dts-jest:fail:snap should not allow calls with Body when input is not defined
fetchClient.dummyWithoutInput({
  Body: 1,
});

// @dts-jest:fail:snap should not allow calls with Query when input is not defined
fetchClient.dummyWithoutInput({
  Query: 1,
});

// @dts-jest:fail:snap should not allow calls with Params when input is not defined
fetchClient.dummyWithoutInput({
  Params: 1,
});

// @dts-jest:fail:snap should not allow calls with Header when input is not defined
fetchClient.dummyWithoutInput({
  Headers: 1,
});

// @dts-jest:fail:snap should not allow empty calls
fetchClient.dummy();

// @dts-jest:fail:snap should not allow empty-object as input
fetchClient.dummy({});

// @dts-jest:fail:snap should not allow calls not specifing Query
fetchClient.dummy({
  Params: { id: '123' },
});

fetchClient.dummy({
  // @dts-jest:fail:snap should not allow calls specifing Params not declared in the endpoint
  Params: { id: '123', foo: 'baz' },
  Query: { color: 'marrone' },
});

fetchClient.dummy({
  Params: { id: '123' },
  Query: { color: 'marrone' },
  // @dts-jest:fail:snap should not allow to add Body when not declared in the endpoint
  Body: { foo: 'baz' },
});

// @dts-jest:fail:snap InferFetchResult should return the type of the Endpoint.Output
const dummyResultWrong: InferFetchResult<typeof fetchClient.dummy> = right({});

// @dts-jest:pass:snap InferFetchResult should return the type of the Endpoint.Output
const dummyResultCorrect: InferFetchResult<typeof fetchClient.dummy> = right({
  crayons: ['brown'],
});

pipe(
  fetchClient.dummyWithError({
    Params: { id: '123' },
    Query: { color: 'marrone' },
  }),
  TA.mapLeft((err) => {
    if (err.details.kind === 'KnownError') {
      if (err.details.status === 401) {
        // @dts-jest:pass:snap you can access KnownErrors with the correct typeguard
        err.details.body.foo;

        // @dts-jest:fail:snap you cannot access KnownErrors without the correct typeguard
        err.details.body.baz;
      }
    }
  })
);
