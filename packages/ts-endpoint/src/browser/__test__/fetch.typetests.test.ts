import { GetFetchHTTPClient } from '../fetch';
import { Endpoint } from '../../Endpoint';
import { StaticHTTPClientConfig } from '../config';
import * as t from 'io-ts';

const options: StaticHTTPClientConfig = {
  protocol: 'http',
  host: 'http://prova',
  port: 2020,
};

const endpoints = {
  prova: Endpoint({
    Input: {
      Query: t.strict({ color: t.string }),
      Params: t.strict({ id: t.string }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: t.strict({ crayons: t.array(t.string) }),
    Opts: { stringifyBody: true },
  }),
};

const fetchClient = GetFetchHTTPClient(options, endpoints);

// @ts-expect-error
fetchClient.prova();

// @ts-expect-error
fetchClient.prova({});

// @ts-expect-error
fetchClient.prova({
  Params: { id: '123' },
});

fetchClient.prova({
  // @ts-expect-error
  Params: { id: '123', foo: 'baz' },
  Query: { color: 'marrone' },
});

fetchClient.prova({
  Params: { id: '123' },
  Query: { color: 'marrone' },
  // @ts-expect-error
  Body: { foo: 'baz' },
});
