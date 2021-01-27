import { GetFetchHTTPClient } from '../fetch';
import { Endpoint } from 'ts-endpoint';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';
import { InferFetchResult } from '..';
import { right } from 'fp-ts/lib/Either';

const options: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'http://test',
  port: 2020,
};

const endpoints = {
  prova: Endpoint({
    Input: {
      Query: { color: t.string },
      Params: { id: t.string },
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.type({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  }),
};

const fetchClient = GetFetchHTTPClient(options, endpoints, {
  handleError: (err, e) => err
});

// @dts-jest:fail:snap should not allow empty calls
fetchClient.prova();

// @dts-jest:fail:snap should not allow empty-object as input
fetchClient.prova({});

// @dts-jest:fail:snap should not allow calls not specifing Query (if needed)
fetchClient.prova({
  Params: { id: '123' },
});

fetchClient.prova({
  // @dts-jest:fail:snap should not allow calls specifing Params not declared in the endpoint
  Params: { id: '123', foo: 'baz' },
  Query: { color: 'marrone' },
});

fetchClient.prova({
  Params: { id: '123' },
  Query: { color: 'marrone' },
  // @dts-jest:fail:snap should not allow to add Body when not declared in the endpoint
  Body: { foo: 'baz' },
});

// @dts-jest:fail:snap InferFetchResult should return the type of the Endpoint.Output
const provaResultWrong: InferFetchResult<typeof fetchClient.prova> = right({});

// @dts-jest:pass:snap InferFetchResult should return the type of the Endpoint.Output
const provaResultCorrect: InferFetchResult<typeof fetchClient.prova> = right({
  crayons: ['brown'],
});
