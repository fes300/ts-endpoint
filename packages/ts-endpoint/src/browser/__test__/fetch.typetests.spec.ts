import { GetFetchHTTPClient } from '../fetch';
import { Endpoint } from '../../Endpoint';
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

const fetchClient = GetFetchHTTPClient(options, endpoints);

describe('GetFetchHTTPClient types behave accordingly', () => {
  // @ts-expect-error
  () => fetchClient.prova();

  // @ts-expect-error
  () => fetchClient.prova({});

  () =>
    // @ts-expect-error
    fetchClient.prova({
      Params: { id: '123' },
    });

  () =>
    fetchClient.prova({
      // @ts-expect-error
      Params: { id: '123', foo: 'baz' },
      Query: { color: 'marrone' },
    });

  () =>
    fetchClient.prova({
      Params: { id: '123' },
      Query: { color: 'marrone' },
      // @ts-expect-error
      Body: { foo: 'baz' },
    });

  () => {
    // @ts-expect-error
    const provaResultWrong: InferFetchResult<typeof fetchClient.prova> = right({});

    const provaResultCorrect: InferFetchResult<typeof fetchClient.prova> = right({
      crayons: ['brown'],
    });
    return [provaResultWrong, provaResultCorrect];
  };

  it("wrong input won't compile", () => {
    expect(true).toBeTruthy();
  });
});
